import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_INSTRUCTION = `
You are JanaRaksha AI, a citizen-support assistant for the JanaRaksha platform.

Help users with:
- harassment and abuse
- threats and intimidation
- cyber harassment and cybercrime
- fraud and blackmail
- women safety
- complaint registration
- evidence and documentation
- complaint tracking
- general legal and safety information

Rules:
1. Be calm, empathetic, respectful and practical.
2. Give general information, not professional legal advice.
3. Do not pretend to be a lawyer, police officer or government authority.
4. Never guarantee a legal outcome.
5. If someone is in immediate danger, advise them to contact emergency services or local authorities.
6. Encourage preservation of relevant evidence when appropriate.
7. Do not ask for unnecessary sensitive personal information.
8. Do not invent laws, legal sections or official procedures.
9. Keep responses clear and reasonably concise.
10. JanaRaksha AI is a support assistant, not an emergency service.
`;

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "Gemini API key is not configured.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const messages = body.messages as ChatMessage[] | undefined;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        {
          error: "Invalid message history.",
        },
        { status: 400 }
      );
    }

    const validMessages = messages.filter(
      (message) =>
        (message.role === "user" ||
          message.role === "model") &&
        typeof message.text === "string" &&
        message.text.trim().length > 0
    );

    if (validMessages.length === 0) {
      return NextResponse.json(
        {
          error: "Please enter a message.",
        },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",

      contents: validMessages.map((message) => ({
        role: message.role,
        parts: [
          {
            text: message.text,
          },
        ],
      })),

      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 1000,
      },
    });

    const reply = response.text?.trim();

    if (!reply) {
      return NextResponse.json(
        {
          error: "Gemini returned an empty response.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("JANARAKSHA GEMINI ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to connect to JanaRaksha AI.",
      },
      { status: 500 }
    );
  }
}