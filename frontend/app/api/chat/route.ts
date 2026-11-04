import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { action, state } = await req.json();

    // System instructions for the Bengaluru AI Narrator
    const systemPrompt = `You are the witty, gritty AI Narrator for "Silk Board Survival", a text-based survival strategy game set in Bengaluru.
The player is at ${state.location} at current time state. Time remaining until 9:10 PM flight.
Player Cash: ₹${state.cash}, Battery: ${state.battery}%.
Analyze the player's action: "${action}". 
Return a JSON response strictly in this format:
{
  "narration": "Your witty, atmospheric response describing the outcome in Bengaluru traffic.",
  "timeDelta": 18,
  "cashDelta": -100,
  "batteryDelta": -8,
  "location": "New Location Name"
}`;

    // Initialize Gemini 3.8 Flash
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(`Player action: ${action}`);
    const textResponse = result.response.text();

    // Parse JSON from Gemini response
    const jsonStart = textResponse.indexOf('{');
    const jsonEnd = textResponse.lastIndexOf('}') + 1;
    const parsedData = JSON.parse(textResponse.substring(jsonStart, jsonEnd));

    return NextResponse.json(parsedData);

  } catch (error) {
    // Intelligent fallback if Gemini API experiences 503 high demand or network timeout
    return NextResponse.json({
      narration: "Google's AI servers are caught in a massive Silk Board traffic jam (503 High Demand). But our local fallback engine kicks in: you negotiate with an auto driver, weave through inner service lanes, and advance forward!",
      timeDelta: 18,
      cashDelta: -80,
      batteryDelta: -5,
      location: "HSR Layout Shortcut"
    });
  }
}