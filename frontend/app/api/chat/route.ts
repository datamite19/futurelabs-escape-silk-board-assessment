import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini 1.5 models are shut down. Override with GEMINI_MODEL in Vercel if needed.
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Set SHOW_AI_ERRORS=true in Vercel to show API errors in the game UI while debugging.
const SHOW_ERRORS = process.env.SHOW_AI_ERRORS === "true";

const DEFAULT_MEME = "/memes/16_traffic.svg";
const FLIGHT_MINUTES = 550; // 9:10 PM, minutes from midnight as used by the game

interface GameState {
  timeMinutes: number;
  location: string;
  cash: number;
  battery: number;
  gameOver: boolean;
}

interface GameResponse {
  text: string;
  timeMinutes: number;
  location: string;
  cash: number;
  battery: number;
  meme: string;
  gameOver: boolean;
}

const DEFAULT_STATE: GameState = {
  timeMinutes: 405,
  location: "Silk Board Junction",
  cash: 1200,
  battery: 42,
  gameOver: false,
};

const FALLBACK_NARRATIVES: string[] = [
  "The traffic sergeant blows his whistle frantically. You squeeze past a row of stalled cabs into a service lane, gaining precious distance towards KIA.",
  "An auto driver shakes his head at first, but after some bargaining agrees to take the shortcut through the narrow inner lanes. Time ticks down!",
  "The overhead electronic board flashes red. You hop onto a passing feeder bus, bypassing a massive gridlock entirely.",
];

// Optional second model to try if the main one is overloaded or slow.
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "";

// Hard limits so the request always finishes before Vercel's timeout.
const TOTAL_BUDGET_MS = 8000;
const ATTEMPT_TIMEOUT_MS = 5000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isBusyError = (message: string): boolean =>
  /503|429|overloaded|high demand|unavailable|quota|timed out/i.test(message);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Gemini timed out after ${ms} ms`)),
      ms
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err: unknown) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

// Tries the main model, then the fallback model (if set), then the main model
// once more, all within TOTAL_BUDGET_MS.
async function generateWithRetry(
  genAI: GoogleGenerativeAI,
  prompt: string
): Promise<string> {
  const startedAt = Date.now();
  const attempts: string[] = [MODEL_NAME];
  if (FALLBACK_MODEL && FALLBACK_MODEL !== MODEL_NAME) {
    attempts.push(FALLBACK_MODEL);
  }
  attempts.push(MODEL_NAME);

  let lastError: unknown = new Error("No attempts were made");

  for (let i = 0; i < attempts.length; i++) {
    const remaining = TOTAL_BUDGET_MS - (Date.now() - startedAt);
    if (remaining < 1500) break;

    try {
      const model = genAI.getGenerativeModel({
        model: attempts[i],
        generationConfig: { responseMimeType: "application/json" },
      });
      const result = await withTimeout(
        model.generateContent(prompt),
        Math.min(ATTEMPT_TIMEOUT_MS, remaining)
      );
      return result.response.text();
    } catch (err: unknown) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      if (!isBusyError(message)) throw err; // real problem: don't retry
      await sleep(300);
    }
  }

  throw lastError;
}

const toNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

function fallbackResponse(state: GameState, debug?: string): GameResponse {
  const text =
    FALLBACK_NARRATIVES[Math.floor(Math.random() * FALLBACK_NARRATIVES.length)];
  const timeMinutes = state.timeMinutes + 15;

  return {
    text: debug ? `AI Error Debug: ${debug}\n\n${text}` : text,
    timeMinutes,
    location:
      state.location === "Silk Board Junction"
        ? "HSR Layout Shortcut"
        : "Outer Ring Road Stretch",
    cash: Math.max(50, state.cash - 100),
    battery: Math.max(5, state.battery - 5),
    meme: DEFAULT_MEME,
    gameOver: timeMinutes > FLIGHT_MINUTES,
  };
}

export async function POST(req: Request) {
  let state: GameState = DEFAULT_STATE;

  try {
    const body = await req.json();
    const action: string =
      typeof body?.action === "string" && body.action.trim()
        ? body.action
        : "Move forward";
    state = { ...DEFAULT_STATE, ...(body?.gameState ?? {}) };

    const apiKey = (process.env.GEMINI_API_KEY ?? "").trim();
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        fallbackResponse(
          state,
          SHOW_ERRORS ? "GEMINI_API_KEY is missing in this environment" : undefined
        )
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = `You are a witty, gritty text-based survival game narrator set in Bengaluru, India.
The player is trying to escape Silk Board Junction to reach Kempegowda International Airport (KIA) before their 9:10 PM flight (${FLIGHT_MINUTES} minutes from midnight).

Current Game State:
- Time (minutes from midnight): ${state.timeMinutes}
- Location: ${state.location}
- Cash: ₹${state.cash}
- Battery: ${state.battery}%

Player's Action: "${action}"

Respond with a single JSON object and nothing else, with exactly these keys:
{
  "text": "Vivid, immersive narration of what happens next (2-4 sentences)",
  "timeMinutes": number (minutes from midnight after this action),
  "location": "Updated location name",
  "cash": number,
  "battery": number,
  "meme": "${DEFAULT_MEME}",
  "gameOver": boolean
}`;

    const raw = await generateWithRetry(genAI, prompt);
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const data: Record<string, unknown> = JSON.parse(cleaned);

    const timeMinutes = toNumber(data.timeMinutes, state.timeMinutes + 15);

    const payload: GameResponse = {
      text:
        typeof data.text === "string" && data.text
          ? data.text
          : "You edge through the dense traffic, one honk at a time.",
      timeMinutes,
      location:
        typeof data.location === "string" && data.location
          ? data.location
          : state.location,
      cash: Math.max(0, toNumber(data.cash, state.cash)),
      battery: clamp(toNumber(data.battery, state.battery), 0, 100),
      meme: typeof data.meme === "string" && data.meme ? data.meme : DEFAULT_MEME,
      gameOver: Boolean(data.gameOver) || timeMinutes > FLIGHT_MINUTES,
    };

    return NextResponse.json(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // Full details go to Vercel's runtime logs.
    console.error("[/api/chat] Gemini call failed:", message);

    return NextResponse.json(
      fallbackResponse(state, SHOW_ERRORS ? message : undefined)
    );
  }
}
