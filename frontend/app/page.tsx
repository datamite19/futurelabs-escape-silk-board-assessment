"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, RotateCcw, Moon, Sun, Send, Battery, Clock, MapPin, DollarSign, ShieldAlert } from 'lucide-react';

interface Turn {
  sender: 'narrator' | 'player';
  text: string;
  meme?: string;
}

interface GameState {
  timeMinutes: number; // e.g. 405 for 6:45 PM
  location: string;
  cash: number;
  battery: number;
  gameOver: boolean;
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [gameState, setGameState] = useState<GameState>({
    timeMinutes: 405, // 6:45 PM
    location: "Silk Board Junction",
    cash: 1200,
    battery: 42,
    gameOver: false,
  });

  const [turns, setTurns] = useState<Turn[]>([
    {
      sender: 'narrator',
      text: "It's 6:45 PM at Silk Board Junction. Your flight leaves Kempegowda International Airport at 9:10 PM. The signal has been red for what feels like a geological era, your phone is at 42%, and you have ₹1,200 in your pocket. What do you do?"
    }
  ]);

  const [inputAction, setInputAction] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat history safely
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [turns, isThinking]);

  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHour}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const handleActionSubmit = async (actionText: string) => {
    if (!actionText.trim() || gameState.gameOver || isThinking) return;

    const userTurn: Turn = { sender: 'player', text: actionText };
    setTurns(prev => [...prev, userTurn]);
    setInputAction('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionText, gameState })
      });

      const data = await res.json();

      setGameState({
        timeMinutes: data.timeMinutes ?? gameState.timeMinutes + 15,
        location: data.location ?? gameState.location,
        cash: data.cash ?? gameState.cash,
        battery: data.battery ?? gameState.battery,
        gameOver: data.gameOver ?? false
      });

      setTurns(prev => [...prev, { sender: 'narrator', text: data.text, meme: data.meme }]);
    } catch (err) {
      setTurns(prev => [...prev, { 
        sender: 'narrator', 
        text: "A sudden wave of Bengaluru traffic gridlock stalls your progress, but you manage to inch forward toward the airport route." 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const resetGame = () => {
    setGameState({
      timeMinutes: 405,
      location: "Silk Board Junction",
      cash: 1200,
      battery: 42,
      gameOver: false,
    });
    setTurns([
      {
        sender: 'narrator',
        text: "It's 6:45 PM at Silk Board Junction. Your flight leaves Kempegowda International Airport at 9:10 PM. The signal has been red for what feels like a geological era, your phone is at 42%, and you have ₹1,200 in your pocket. What do you do?"
      }
    ]);
  };

  const suggestedActions = [
    "Book a bike taxi",
    "Take the metro to the nearest station",
    "Wait it out in the cab",
    "Walk along the service road"
  ];

  const overlay = theme === 'dark' 
    ? 'linear-gradient(to bottom, rgba(3, 7, 18, 0.92), rgba(15, 23, 42, 0.96))' 
    : 'linear-gradient(to bottom, rgba(248, 250, 252, 0.92), rgba(241, 245, 249, 0.96))';

  return (
    <main 
      className={`min-h-screen w-full transition-colors duration-300 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
      style={{
        backgroundImage: `${overlay}, url('/memes/16_traffic.svg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-3xl mx-auto p-4 sm:p-6 flex flex-col min-h-screen">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/40 backdrop-blur-md">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              Silk Board Survival
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Namma Bengaluru Traffic Edition. Reach KIA before 9:10 PM.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={resetGame} 
              title="Reset Game"
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle Theme"
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </button>
          </div>
        </header>

        {/* HUD Status Bar */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl mb-6 border shadow-xl backdrop-blur-md ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <div>
              <div className="text-xs text-slate-400">Time</div>
              <div className="font-bold text-sm sm:text-base">{formatTime(gameState.timeMinutes)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-xs text-slate-400">Location</div>
              <div className="font-bold text-xs sm:text-sm truncate max-w-[120px]">{gameState.location}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <div>
              <div className="text-xs text-slate-400">Cash</div>
              <div className="font-bold text-sm sm:text-base">₹{gameState.cash}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Battery className="w-5 h-5 text-cyan-500" />
            <div>
              <div className="text-xs text-slate-400">Battery</div>
              <div className="font-bold text-sm sm:text-base">{gameState.battery}%</div>
            </div>
          </div>
        </div>

        {/* Chat / Narrative Window */}
        <div 
          ref={chatScrollRef} 
          className={`flex-1 overflow-y-auto max-h-[50vh] sm:max-h-[55vh] p-4 rounded-2xl mb-4 space-y-4 border backdrop-blur-md ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white/90 border-slate-200'}`}
        >
          {turns.map((turn, idx) => (
            <div key={idx} className={`flex flex-col ${turn.sender === 'player' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm sm:text-base shadow-md ${
                turn.sender === 'player' 
                  ? 'bg-amber-600 text-white rounded-br-none' 
                  : theme === 'dark' ? 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-slate-700/50' : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200'
              }`}>
                {turn.text}
                {turn.meme && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-slate-700">
                    <img src={turn.meme} alt="Traffic situation visual" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-slate-400 text-sm italic p-2">
              <span className="animate-pulse">Navigating through the Bengaluru gridlock...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Actions */}
        {!gameState.gameOver && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleActionSubmit(action)}
                disabled={isThinking}
                className={`text-xs sm:text-sm px-3.5 py-2 rounded-full border transition-all backdrop-blur-sm ${
                  theme === 'dark' 
                    ? 'border-slate-700/80 bg-slate-800/70 hover:bg-slate-700 text-slate-300' 
                    : 'border-slate-300 bg-white/80 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="mt-auto">
          {gameState.gameOver ? (
            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-center space-y-3 backdrop-blur-md">
              <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
              <h2 className="font-bold text-lg text-red-400">Game Over</h2>
              <p className="text-xs sm:text-sm text-slate-300">Your flight departed without you, or your phone battery gave out in the middle of Silk Board!</p>
              <button
                onClick={resetGame}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          ) : (
            <form 
              onSubmit={(e) => { e.preventDefault(); handleActionSubmit(inputAction); }}
              className={`flex items-center gap-2 p-2 rounded-2xl border backdrop-blur-md shadow-lg ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}
            >
              <input
                type="text"
                value={inputAction}
                onChange={(e) => setInputAction(e.target.value)}
                placeholder="What do you do next?"
                disabled={isThinking}
                className="flex-1 bg-transparent px-4 py-2 text-sm sm:text-base focus:outline-none"
              />
              <button
                type="submit"
                disabled={isThinking || !inputAction.trim()}
                className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>

      </div>
    </main>
  );
}
