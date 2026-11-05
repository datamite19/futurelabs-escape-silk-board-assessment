import Link from "next/link";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

interface Meme {
  url: string;
  title: string;
  caption: string;
  tag: string;
}

// Swap each `url` for a file in frontend/public/memes, e.g. "/memes/silk-board.jpg".
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80";

const memes: Meme[] = [
  {
    url: FALLBACK_IMAGE,
    title: "The Silk Board Standstill",
    caption: "Five minutes away, said the map. Ninety minutes ago.",
    tag: "Traffic",
  },
  {
    url: FALLBACK_IMAGE,
    title: "Auto Fare Negotiation",
    caption: "Meter is broken, sir. Flat 800.",
    tag: "Autos",
  },
  {
    url: FALLBACK_IMAGE,
    title: "Last Resort: The Bike Taxi",
    caption: "Helmet optional, prayers mandatory.",
    tag: "Survival",
  },
  {
    url: FALLBACK_IMAGE,
    title: "Gate Closes in 10 Minutes",
    caption: "Running through KIA with 3% battery.",
    tag: "Endgame",
  },
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-100 md:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              aria-label="Back to game"
              className="rounded-2xl border border-slate-800 bg-slate-900 p-3 text-blue-400 transition hover:bg-slate-800"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </Link>
            <div>
              <h1 className="bg-gradient-to-r from-yellow-400 via-orange-400 to-blue-400 bg-clip-text text-2xl font-black text-transparent">
                Namma Bengaluru Meme &amp; Lore Gallery
              </h1>
              <p className="text-xs text-slate-400">
                Captured moments from the legendary Silk Board survival runs.
              </p>
            </div>
          </div>

          <ImageIcon size={22} className="text-slate-500" aria-hidden="true" />
        </div>

        {/* Meme Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {memes.map((meme) => (
            <div
              key={meme.title}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl"
            >
              <div className="relative h-56 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meme.url}
                  alt={meme.title}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
                <span className="absolute right-3 top-3 rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 font-mono text-xs text-amber-400 backdrop-blur-md">
                  {meme.tag}
                </span>
              </div>
              <div className="space-y-2 p-6">
                <h3 className="text-lg font-bold text-slate-100">{meme.title}</h3>
                <p className="font-mono text-sm italic text-slate-400">
                  &ldquo;{meme.caption}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}