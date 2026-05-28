import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// ─── In-Memory Chunk Store ────────────────────────────────────────────────────
// Replaces ChromaDB + @xenova/transformers with a pure-JS solution
// that works on Vercel serverless without any native binary dependencies.

interface StoredChunk {
  id: string;
  text: string;
  videoId: string;
  videoTitle: string;
  chunkIndex: number;
  terms: Map<string, number>; // term → TF score
}

interface Session {
  chunks: StoredChunk[];
  idf: Map<string, number>; // term → IDF score (computed lazily)
  idfDirty: boolean;
}

const sessions = new Map<string, Session>();

// ─── Text Processing Utilities ────────────────────────────────────────────────

/** Tokenize text into lowercase terms, stripping punctuation */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

/** Compute term frequency (TF) for a list of tokens */
function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  // Normalize by document length
  for (const [term, count] of tf) {
    tf.set(term, count / tokens.length);
  }
  return tf;
}

/** Compute IDF across all chunks in a session */
function computeIDF(session: Session): void {
  const N = session.chunks.length;
  if (N === 0) return;
  const idf = new Map<string, number>();

  // Count how many documents contain each term
  const docFreq = new Map<string, number>();
  for (const chunk of session.chunks) {
    for (const term of chunk.terms.keys()) {
      docFreq.set(term, (docFreq.get(term) || 0) + 1);
    }
  }

  // IDF = log(N / df)
  for (const [term, df] of docFreq) {
    idf.set(term, Math.log((N + 1) / (df + 1)) + 1); // smoothed IDF
  }

  session.idf = idf;
  session.idfDirty = false;
}

/** Score a chunk against a query using TF-IDF cosine similarity */
function scoreTFIDF(
  chunkTF: Map<string, number>,
  queryTF: Map<string, number>,
  idf: Map<string, number>
): number {
  let dotProduct = 0;
  let chunkMag = 0;
  let queryMag = 0;

  // Build TF-IDF vectors and compute cosine similarity
  const allTerms = new Set([...chunkTF.keys(), ...queryTF.keys()]);

  for (const term of allTerms) {
    const idfVal = idf.get(term) || 1;
    const chunkVal = (chunkTF.get(term) || 0) * idfVal;
    const queryVal = (queryTF.get(term) || 0) * idfVal;
    dotProduct += chunkVal * queryVal;
    chunkMag += chunkVal * chunkVal;
    queryMag += queryVal * queryVal;
  }

  if (chunkMag === 0 || queryMag === 0) return 0;
  return dotProduct / (Math.sqrt(chunkMag) * Math.sqrt(queryMag));
}

// ─── Public API (same interface as before) ────────────────────────────────────

export async function chunkText(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  return await splitter.splitText(text);
}

export async function embedAndStore(
  sessionId: string,
  videoId: string,
  videoTitle: string,
  transcript: string | null
): Promise<void> {
  if (!transcript) return; // Skip videos with disabled transcripts
  const chunks = await chunkText(transcript);

  // Get or create session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { chunks: [], idf: new Map(), idfDirty: true });
  }
  const session = sessions.get(sessionId)!;

  // Store each chunk with its TF vector
  for (let i = 0; i < chunks.length; i++) {
    const tokens = tokenize(chunks[i]);
    session.chunks.push({
      id: `${videoId}_chunk_${i}`,
      text: chunks[i],
      videoId,
      videoTitle,
      chunkIndex: i,
      terms: computeTF(tokens),
    });
  }

  // Mark IDF as needing recomputation
  session.idfDirty = true;
}

export async function retrieveRelevantChunks(
  sessionId: string,
  query: string,
  nResults = 5
): Promise<{ text: string; videoId: string; videoTitle: string; chunkIndex: number }[]> {
  const session = sessions.get(sessionId);
  if (!session || session.chunks.length === 0) {
    return [];
  }

  // Recompute IDF if needed
  if (session.idfDirty) {
    computeIDF(session);
  }

  // Tokenize and compute TF for the query
  const queryTokens = tokenize(query);
  const queryTF = computeTF(queryTokens);

  // Score all chunks
  const scored = session.chunks.map(chunk => ({
    chunk,
    score: scoreTFIDF(chunk.terms, queryTF, session.idf),
  }));

  // Sort by score descending and take top N
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, nResults).map(({ chunk }) => ({
    text: chunk.text,
    videoId: chunk.videoId,
    videoTitle: chunk.videoTitle,
    chunkIndex: chunk.chunkIndex,
  }));
}
