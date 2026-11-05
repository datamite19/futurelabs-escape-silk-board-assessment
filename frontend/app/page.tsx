"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import {
  BatteryMedium,
  Clock,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Moon,
  RotateCcw,
  Send,
  Sun,
  Wallet,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type Theme = "light" | "dark";
type GameStatus = "playing" | "won" | "lost";
type Role = "narrator" | "player";

interface GameState {
  time: string;
  location: string;
  cash: number;
  battery: number;
  status: GameStatus;
}

interface Turn {
  id: number;
  role: Role;
  text: string;
}

interface ChatResponse {
  narration?: string;
  state?: Partial<GameState>;
  error?: string;
}

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const THEME_KEY = "silk-board-theme";

const INITIAL_STATE: GameState = {
  time: "6:45 PM",
  location: "Silk Board Junction",
  cash: 1200,
  battery: 42,
  status: "playing",
};

const INTRO_TEXT =
  "It's 6:45 PM at Silk Board Junction. Your flight leaves Kempegowda International Airport at 9:10 PM. " +
  "The signal has been red for what feels like a geological era, your phone is at 42%, and you have ₹1,200 in your pocket. " +
  "What do you do?";

const QUICK_ACTIONS: string[] = [
  "Book a bike taxi",
  "Take the metro to the nearest station",
  "Wait it out in the cab",
  "Walk along the service road",
];

const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [game, setGame] = useState<GameState>(INITIAL_STATE);
  const [turns, setTurns] = useState<Turn[]>([
    { id: 0, role: "narrator", text: INTRO_TEXT },
  ]);
  const [input, setInput] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Explicitly typed so TypeScript never narrows `.current` to `never`.
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const nextId = useRef<number>(1);

  /* ---- theme persistence (SSR-safe) ---- */
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      }
    } catch {
      /* storage unavailable: keep default */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  /* ---- auto-scroll ---- */
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [turns, isThinking]);

  /* ---- game actions ---- */
  const pushTurn = useCallback((role: Role, text: string): void => {
    const id = nextId.current;
    nextId.current += 1;
    setTurns((prev) => [...prev, { id, role, text }]);
  }, []);

  const sendAction = useCallback(
    async (raw: string): Promise<void> => {
      const message = raw.trim();
      if (!message || isThinking || game.status !== "playing") return;

      pushTurn("player", message);
      setInput("");
      setIsThinking(true);

      try {
        const history = turns.slice(-10).map((t) => ({
          role: t.role === "player" ? "user" : "model",
          text: t.text,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, state: game, history }),
        });

        const data: ChatResponse = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error ?? `Request failed (${res.status})`);
        }

        if (data.narration) {
          pushTurn("narrator", data.narration);
        }

        if (data.state) {
          const patch = data.state;
          setGame((prev) => ({
            time: patch.time ?? prev.time,
            location: patch.location ?? prev.location,
            cash: clamp(patch.cash ?? prev.cash, 0, 1_000_000),
            battery: clamp(patch.battery ?? prev.battery, 0, 100),
            status: patch.status ?? prev.status,
          }));
        }
      } catch (err) {
        const reason = err instanceof Error ? err.message : "Unknown error";
        pushTurn(
          "narrator",
          `The network dropped out (like everything else on Outer Ring Road). ${reason}. Try again.`
        );
      } finally {
        setIsThinking(false);
      }
    },
    [game, isThinking, pushTurn, turns]
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void sendAction(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendAction(input);
    }
  };

  const resetGame = (): void => {
    setGame(INITIAL_STATE);
    nextId.current = 1;
    setTurns([{ id: 0, role: "narrator", text: INTRO_TEXT }]);
    setInput("");
    setIsThinking(false);
  };

  /* ---- theme tokens ---- */
  const dark = theme === "dark";
  const shell = dark ? "text-stone-100" : "text-stone-900";
  const overlay = dark
    ? "linear-gradient(180deg, rgba(12,10,9,0.82) 0%, rgba(12,10,9,0.94) 100%)"
    : "linear-gradient(180deg, rgba(250,250,249,0.86) 0%, rgba(245,245,244,0.95) 100%)";
  const panel = dark
    ? "bg-stone-900/80 border-stone-700"
    : "bg-white/85 border-stone-300";
  const narratorBubble = dark
    ? "bg-stone-800 border-stone-700 text-stone-100"
    : "bg-stone-100 border-stone-300 text-stone-900";
  const playerBubble = dark
    ? "bg-amber-400 text-stone-950 border-amber-300"
    : "bg-amber-500 text-stone-950 border-amber-600";
  const subtle = dark ? "text-stone-400" : "text-stone-600";
  const iconBtn = dark
    ? "border-stone-600 hover:bg-stone-800"
    : "border-stone-400 hover:bg-stone-200";

  const batteryLow = game.battery <= 15;
  const finished = game.status !== "playing";

  return (
    <main
      className={`min-h-screen w-full ${shell}`}
      style={{
        backgroundImage: `${overlay}, url('/bengaluru-highway.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: dark ? "#0c0a09" : "#fafaf9",
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-4 sm:py-6">
        {/* Header */}
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Silk Board Survival
            </h1>
            <p className={`text-sm ${subtle}`}>
              Namma Bengaluru Traffic Edition. Reach KIA before 9:10 PM.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/gallery"
              aria-label="Open meme gallery"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${iconBtn} focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`}
            >
              <ImageIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={resetGame}
              aria-label="Restart game"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${iconBtn} focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`}
            >
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${iconBtn} focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`}
            >
              {dark ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        {/* HUD */}
        <section
          aria-label="Game status"
          className={`mb-3 grid grid-cols-2 gap-2 rounded-xl border p-3 backdrop-blur sm:grid-cols-4 ${panel}`}
        >
          <HudItem
            icon={<Clock className="h-4 w-4" aria-hidden="true" />}
            label="Time"
            value={game.time}
            subtle={subtle}
          />
          <HudItem
            icon={<MapPin className="h-4 w-4" aria-hidden="true" />}
            label="Location"
            value={game.location}
            subtle={subtle}
          />
          <HudItem
            icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
            label="Cash"
            value={`₹${game.cash.toLocaleString("en-IN")}`}
            subtle={subtle}
          />
          <HudItem
            icon={<BatteryMedium className="h-4 w-4" aria-hidden="true" />}
            label="Battery"
            value={`${game.battery}%`}
            subtle={subtle}
            warn={batteryLow}
          />
        </section>

        {/* Chat */}
        <section
          aria-label="Story"
          className={`flex min-h-0 flex-1 flex-col rounded-xl border backdrop-blur ${panel}`}
        >
          <div
            ref={chatScrollRef}
            className="flex-1 space-y-3 overflow-y-auto p-4"
            style={{ maxHeight: "55vh", minHeight: "300px" }}
            aria-live="polite"
          >
            {turns.map((t) => (
              <div
                key={t.id}
                className={`flex ${t.role === "player" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl border px-4 py-2 text-sm leading-relaxed sm:text-base ${
                    t.role === "player" ? playerBubble : narratorBubble
                  }`}
                >
                  {t.text}
                </p>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <p
                  className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm ${narratorBubble}`}
                >
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Traffic is deciding your fate…
                </p>
              </div>
            )}

            {finished && (
              <div
                className={`rounded-xl border px-4 py-3 text-center text-sm font-semibold ${
                  game.status === "won"
                    ? "border-emerald-500 text-emerald-500"
                    : "border-red-500 text-red-500"
                }`}
              >
                {game.status === "won"
                  ? "You made it to the gate. Flight caught."
                  : "The flight has left without you."}
              </div>
            )}
          </div>

          {/* Quick actions */}
          {!finished && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  disabled={isThinking}
                  onClick={() => void sendAction(a)}
                  className={`rounded-full border px-3 py-1 text-xs disabled:opacity-50 sm:text-sm ${iconBtn} focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`}
                >
                  {a}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className={`flex items-center gap-2 border-t p-3 ${
              dark ? "border-stone-700" : "border-stone-300"
            }`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isThinking || finished}
              placeholder={
                finished ? "Game over. Press restart to play again." : "What do you do?"
              }
              aria-label="Your next move"
              className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-60 sm:text-base ${
                dark
                  ? "border-stone-600 bg-stone-950 text-stone-100 placeholder:text-stone-500"
                  : "border-stone-400 bg-white text-stone-900 placeholder:text-stone-500"
              }`}
            />
            <button
              type="submit"
              disabled={isThinking || finished || input.trim().length === 0}
              aria-label="Send move"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-stone-950 hover:bg-amber-300 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              <Send className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* HUD item                                                           */
/* ------------------------------------------------------------------ */

interface HudItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtle: string;
  warn?: boolean;
}

function HudItem({ icon, label, value, subtle, warn = false }: HudItemProps) {
  return (
    <div className="min-w-0">
      <div className={`flex items-center gap-1 text-xs ${subtle}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div
        className={`truncate text-sm font-semibold sm:text-base ${
          warn ? "text-red-500" : ""
        }`}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}