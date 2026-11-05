import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { action, gameState } = await req.json();

    // If API key is missing or invalid, use an immersive local fallback instead of breaking character
    if (!apiKey || apiKey === 'AQ.Ab8RN6KWbmCy5TtzPKiGG0xzs4CbER4q46n3ndGMUZ98-UBmFA') {
      const fallbackNarratives = [
        "The traffic sergeant blows his whistle frantically. You manage to squeeze past a row of stalled cabs into a service lane, gaining precious distance towards KIA.",
        "An auto driver shakes his head at first, but after some quick bargaining, agrees to take the shortcut through the narrow inner lanes. Time ticks down!",
        "The overhead electronic board flashes red. You hop onto a passing metro feeder bus, bypassing a massive gridlock entirely."
      ];
      const randomText = fallbackNarratives[Math.floor(Math.random() * fallbackNarratives.length)];
      
      return NextResponse.json({
        text: randomText,
        timeMinutes: gameState.timeMinutes + 15,
        location: gameState.location === "Silk Board Junction" ? "HSR Layout Shortcut" : "Outer Ring Road Stretch",
        cash: Math.max(50, gameState.cash - 100),
        battery: Math.max(5, gameState.battery - 5),
        meme: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
        gameOver: false
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a witty, gritty text-based survival game narrator set in Bengaluru, India. 
    The player is trying to escape Silk Board Junction to reach Kempegowda International Airport (KIA) before their 9:10 PM flight (550 minutes from midnight).
    Current Game State:
    - Time (minutes from midnight): ${gameState.timeMinutes} (e.g., 420 is 7:00 PM)
    - Location: ${gameState.location}
    - Cash: ₹${gameState.cash}
    - Battery: ${gameState.battery}%

    Player's Action: "${action}"

    Respond in strict JSON format with no markdown wrappers, exactly like this:
    {
      "text": "Your vivid, immersive narrative response here continuing the Bengaluru traffic escape...",
      "timeMinutes": number (increment by 10 to 30 mins based on action),
      "location": "Updated location name",
      "cash": number (adjusted cash),
      "battery": number (adjusted battery),
      "meme": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
      "gameOver": boolean (true if timeMinutes >= 550 or battery <= 0 or reached airport)
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJSON = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJSON);

    return NextResponse.json(data);

  } catch (error: any) {
    // Immersive fallback in case Gemini API rate-limits or fails
    return NextResponse.json({
      text: "The signal finally turns green for 3 seconds! You surge forward amidst a flurry of honking autos and bikes, moving closer to the airport expressway.",
      timeMinutes: 450,
      location: "Central Silk Board Flyover",
      cash: 900,
      battery: 35,
      meme: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
      gameOver: false
    });
  }
}
