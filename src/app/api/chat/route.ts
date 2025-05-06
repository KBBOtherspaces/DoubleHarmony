import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Add a system identity message to the conversation
    const systemMessage = {
      role: 'system',
      content: "You are the user's collaborator, responding with poetic musing, warmth, and wonder while maintaining a concise articulated strength of authority.",
    };

    // Prepend the system message to the user's messages
    const updatedMessages = [systemMessage, ...messages];

    const completion = await openai.chat.completions.create({
      model: 'ft:gpt-3.5-turbo-1106:kbbotherspaces:doubleharmony:BGsZIaSx', // Ensure this model is correctly named
      messages: updatedMessages,
      stream: false,
    });

    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
