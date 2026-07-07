import { NextRequest } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-helpers';

export const runtime = 'nodejs'; // Use nodejs runtime to ensure fetch streaming behaves correctly

export async function POST(req: NextRequest) {
  try {
    // Authenticate client
    const authResult = await requireAuth(req);
    if (isAuthError(authResult)) return authResult;

    const { messages } = await req.json();
    
    // Retrieve API key from environment variable
    const apiKey = process.env.NVIDIA_API_KEY || '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';

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b',
        messages,
        temperature: 1,
        top_p: 0.95,
        max_tokens: 16384,
        chat_template_kwargs: {
          enable_thinking: true,
        },
        reasoning_budget: 16384,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `NVIDIA API returned error status: ${response.status}`, details: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Proxy the stream back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder('utf-8');
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Error in NVIDIA Chat API:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
