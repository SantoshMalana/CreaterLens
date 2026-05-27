import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ChromaClient } from 'chromadb';

const client = new ChromaClient({ path: 'http://localhost:8000' });

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
  transcript: string
): Promise<void> {
  const { pipeline } = await import('@xenova/transformers');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const chunks = await chunkText(transcript);
  const collection = await client.getOrCreateCollection({ name: sessionId });

  const embeddings: number[][] = [];
  for (const chunk of chunks) {
    const output = await embedder(chunk, { pooling: 'mean', normalize: true });
    embeddings.push(Array.from(output.data));
  }

  await collection.add({
    ids: chunks.map((_, i) => `${videoId}_chunk_${i}`),
    embeddings,
    documents: chunks,
    metadatas: chunks.map((_, i) => ({
      videoId,
      videoTitle,
      chunkIndex: i,
    })),
  });
}

export async function retrieveRelevantChunks(
  sessionId: string,
  query: string,
  nResults = 5
): Promise<{ text: string; videoId: string; videoTitle: string; chunkIndex: number }[]> {
  const { pipeline } = await import('@xenova/transformers');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const output = await embedder(query, { pooling: 'mean', normalize: true });
  const queryEmbedding = Array.from(output.data) as number[];

  const collection = await client.getCollection({ name: sessionId });
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults,
  });

  return (results.documents[0] || []).map((doc, i) => ({
    text: doc || '',
    videoId: results.metadatas[0][i].videoId as string,
    videoTitle: results.metadatas[0][i].videoTitle as string,
    chunkIndex: results.metadatas[0][i].chunkIndex as number,
  }));
}
