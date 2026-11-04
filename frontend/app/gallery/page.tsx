"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ImageIcon, RotateCcw, ArrowLeft, Trophy } from 'lucide-react';

export default function GalleryPage() {
  const [memes] = useState([
    {
      title: "The Eternal Meter",
      caption: "Auto driver: 'Meter? No sir, meter is broken since 2018.'",
      url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80",
      tag: "#SilkBoardVortex"
    },
    {
      title: "The Teleporting Cab",
      caption: "Your cab driver accepted your ride and is moving in the exact opposite direction.",
      url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80",
      tag: "#NammaBengaluruTraffic"
    },
    {
      title: "The Shortcut Trap",
      caption: "Friend: 'Bro I know a shortcut!' *Takes you through 3km of waterlogged muddy lanes*",
      url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80",
      tag: "#ShortcutDisaster"
    },
    {
      title: "The 4-Second Green Light",
      caption: "Signal turns green for 4 seconds. Exactly 1 bike crosses. Light turns red again for 8 minutes.",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
      tag: "#SignalSadness"
    }
  ]);

  const handleReset = () => {
    alert("Game progress reset!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition text-blue-400">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-blue-400 bg-clip-text text-transparent">
                Namma Bengaluru Meme & Lore Gallery
              </h1>
              <p className="text-xs text-slate-400">Captured moments from the legendary Silk Board survival runs.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/gallery" className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 hover:text-blue-300 transition">
              <ImageIcon size={18} />
            </Link>
            <button onClick={handleReset} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition">
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Meme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memes.map((meme, idx) => (
            <div key={idx} className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl flex flex-col justify-between">
              <div className="h-56 overflow-hidden relative">
                <img src={meme.url} alt={meme.title} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-amber-400 border border-slate-700">
                  {meme.tag}
                </span>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-lg font-bold text-slate-100">{meme.title}</h3>
                <p className="text-sm text-slate-400 font-mono italic">"{meme.caption}"</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}