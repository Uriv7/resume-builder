import { NextResponse } from 'next/server';

// Debug logging for environment variable
console.log('API Key available:', true);

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages } = body;
    console.log('Received messages:', messages); // Debug log

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Combine all user messages into a single prompt
    const userMessages = messages.filter(msg => msg.role === 'user');
    const latestMessage = userMessages[userMessages.length - 1]?.content || '';

    // Create the prompt for Cohere
    const prompt = `You are a professional resume writing assistant. Your goal is to help users create compelling resumes.
    Focus on providing specific, actionable advice for resume sections like:
    - Work experience (using strong action verbs and quantifiable achievements)
    - Education (proper formatting and relevant details)
    - Skills (both technical and soft skills)
    - Projects (highlighting key achievements)
    - Summary/Objective statements
    Keep responses concise and practical.

    User query: ${latestMessage}`;

    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer nybKSeMjDegp49u2Fq6xXPnBPeQuUd1AwPEs3bJX`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command",
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API request failed with status ${response.status}: ${errorData.message || "Unknown error"}`
      );
    }

    const result = await response.json();
    const text = result.generations?.[0]?.text || "AI did not return a result.";

    return NextResponse.json({ 
      message: text.trim(),
      status: 'success'
    });
  } catch (error) {
    console.error('Chat API Error:', error); // Debug log

    // Provide more specific error messages
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid API key provided' },
        { status: 401 }
      );
    }
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'API quota exceeded' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'An error occurred while processing your request',
        status: 'error'
      },
      { status: 500 }
    );
  }
}
