"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, Battery, Clock, MapPin, Wallet, RotateCcw, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface GameState {
  elapsed_time_minutes: number;
  cash: number;
  battery: number;
  current_location: string;
  inventory: string[];
  game_over: boolean;
  victory: boolean;
  termination_reason: string;
}

interface Message {
  id: string;
  role: 'user' | 'narrator';
  content: string;
  memePath?: string;
}

interface MemeManifest {
  id: string;
  path: string;
  category: string;
  keywords: string[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [memeLibrary, setMemeLibrary] = useState<MemeManifest[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Load memes
    fetch('/memes/meme_manifest.json')
      .then(res => res.json())
      .then(data => setMemeLibrary(data))
      .catch(console.error);

    // Fetch initial state
    fetch('/api/state')
      .then(res => res.json())
      .then(data => {
        setGameState(data);
        setMessages([{
          id: Date.now().toString(),
          role: 'narrator',
          content: "Welcome to Silk Board, maga. It's 7:00 PM. Your flight from KIA boards at 9:10 PM. Traffic is standing still. What's your move?"
        }]);
      });
  }, []);

  const formatTime = (elapsedMinutes: number) => {
    const totalMinutes = (19 * 60) + elapsedMinutes; 
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMins = mins < 10 ? `0${mins}` : mins;
    return `${formattedHours}:${formattedMins} ${ampm}`;
  };

  const findMemeForText = (text: string): string | undefined => {
    const lowerText = text.toLowerCase();
    // Shuffle memes so we don't always get the exact same one if keywords overlap
    const shuffled = [...memeLibrary].sort(() => 0.5 - Math.random());
    for (const meme of shuffled) {
      if (meme.keywords.some(kw => lowerText.includes(kw))) {
        return meme.path;
      }
    }
    return undefined;
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || gameState?.game_over) return;

    const userText = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userText
    }]);
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: userText })
      });

      const data = await response.json();

      if (data.error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'narrator', content: `Error: ${data.error}` }]);
      } else {
        setGameState(data.state);
        
        // Find a matching meme!
        const matchingMeme = findMemeForText(data.narration);

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'narrator',
          content: data.narration,
          memePath: matchingMeme
        }]);

        if (data.state.game_over) {
          setTimeout(() => {
            const gameOverMeme = data.state.victory ? '/memes/20_success.svg' : '/memes/6_failure.svg';
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              role: 'narrator',
              content: data.state.victory 
                ? `🏆 VICTORY! ${data.state.termination_reason}` 
                : `💀 GAME OVER. ${data.state.termination_reason}`,
              memePath: gameOverMeme
            }]);
          }, 1000);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'narrator', content: "Lost connection to the matrix (Engine offline)." }]);
    }

    setIsLoading(false);
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      setGameState(data);
      setMessages([{
        id: Date.now().toString(),
        role: 'narrator',
        content: "Time loop reset. You're back at Silk Board. 7:00 PM. Go."
      }]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  if (!gameState) return <div className="h-screen flex items-center justify-center font-sans">Loading Game Engine...</div>;

  return (
    <div className="h-screen w-full bg-game-bg flex flex-col md:max-w-md md:mx-auto md:shadow-2xl md:border-x border-gray-200 overflow-hidden font-sans relative">
      
      {/* Top Status Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-3 z-10">
        <div className="flex justify-between items-center mb-2">
          <h1 className="font-bold text-sm text-gray-800 tracking-tight">Silk Board Survival</h1>
          <div className="flex gap-3">
            <Link href="/gallery" className="text-gray-400 hover:text-blue-500 transition">
              <ImageIcon size={16} title="View Meme Gallery" />
            </Link>
            <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 transition">
              <RotateCcw size={16} title="Reset Game" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-md">
            <Clock size={14} className="text-blue-500" />
            <span>{formatTime(gameState.elapsed_time_minutes)}</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-md">
            <MapPin size={14} className="text-red-500" />
            <span className="truncate">{gameState.current_location}</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-md">
            <Wallet size={14} className="text-green-600" />
            <span>₹{gameState.cash}</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-md">
            <Battery size={14} className={gameState.battery < 20 ? "text-red-500" : "text-gray-700"} />
            <span>{gameState.battery}%</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`max-w-[80%] p-3 text-[15px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-imessage-blue text-white rounded-2xl rounded-br-sm' 
                  : 'bg-imessage-gray text-black rounded-2xl rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
            {/* Render Meme if attached */}
            {msg.memePath && (
              <div className="mt-2 max-w-[80%] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img src={msg.memePath} alt="Narrator Reaction" className="w-full object-contain" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-imessage-gray text-gray-500 rounded-2xl rounded-bl-sm p-3 shadow-sm flex gap-1">
              <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="bg-white p-3 border-t border-gray-200 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={gameState.game_over ? "Game Over" : "Type a message..."}
          disabled={isLoading || gameState.game_over}
          className="flex-1 bg-white border border-gray-300 rounded-2xl px-4 py-2 text-[15px] focus:outline-none focus:border-imessage-blue resize-none max-h-32 min-h-[40px]"
          rows={1}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading || gameState.game_over}
          className="bg-imessage-blue text-white rounded-full p-2 h-10 w-10 flex items-center justify-center disabled:opacity-50 transition-opacity flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </form>

    </div>
  );
}