import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const dynamic = 'force-dynamic';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { videoTitles } = await req.json();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You generate exactly 4 short, specific questions a YouTube creator would ask when comparing two videos. Output ONLY a JSON array of 4 strings, no markdown, no explanation.`,
        },
        {
          role: 'user',
          content: `Generate 4 comparison questions for these videos:\n1. "${videoTitles[0]}"\n2. "${videoTitles[1]}"`,
        },
      ],
      max_tokens: 256,
      temperature: 0.8,
    });

    const raw = completion.choices[0]?.message?.content || '[]';
    // Extract JSON array from response
    const match = raw.match(/\[[\s\S]*\]/);
    const questions = match ? JSON.parse(match[0]) : [
      `Why did "${videoTitles[0]}" get more engagement?`,
      `What made the hook in "${videoTitles[1]}" weaker?`,
      `Compare the pacing of both videos`,
      `What improvements would help the lower-performing video?`,
    ];

    return NextResponse.json({ questions });
  } catch (error: any) {
    return NextResponse.json({
      questions: [
        'Which video has a stronger hook?',
        'Why did one video outperform the other?',
        'What improvements can I make to my content?',
        'Compare the opening 30 seconds of both videos',
      ],
    });
  }
}
