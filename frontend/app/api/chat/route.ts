import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { action, gameState } = await req.json();

    // If API key is missing or invalid, use an immersive local fallback
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
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
        meme: "/memes/16_traffic.svg",
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
      "meme": "/memes/16_traffic.svg",
      "gameOver": boolean (true if timeMinutes >= 550 or battery <= 0 or reached airport)
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJSON = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJSON);

    return NextResponse.json({
      text: data.text || "You navigate through the dense traffic successfully.",
      timeMinutes: data.timeMinutes || gameState.timeMinutes + 15,
      location: data.location || gameState.location,
      cash: data.cash ?? gameState.cash,
      battery: data.battery ?? gameState.battery,
      meme: data.meme || "/memes/16_traffic.svg",
      gameOver: data.gameOver || false
    });

  } catch (error: any) {
    return NextResponse.json({
      text: "The signal finally turns green for 3 seconds! You surge forward amidst a flurry of honking autos and bikes, moving closer to the airport expressway.",
      timeMinutes: gameState.timeMinutes + 15,
      location: "Central Silk Board Flyover",
      cash: Math.max(50, gameState.cash - 50),
      battery: Math.max(5, gameState.battery - 5),
      meme: "/memes/16_traffic.svg",
      gameOver: false
    });
  }
}
