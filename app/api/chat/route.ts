import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // 認証情報を取得
    const { userId } = await auth();

    // 認証されていない場合はエラー
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    // UIMessageをModelMessageに変換
    const modelMessages = convertToModelMessages(messages);

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

