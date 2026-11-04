"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [theme, setTheme] = useState('dark');

  const [gameState, setGameState] = useState({
    timeMinutes: 420, // 7:00 PM
    location: "Silk Board Junction",
    cash: 1000,
    battery: 100,
    gameOver: false,
    statusMessage: "Flight from KIA boards at 9:10 PM. Traffic is standing still."
  });

  const [turns, setTurns] = useState([
    {
      role: "narrator",
      time: "7:00 PM",
      location: "Silk Board Junction",
      text: "Welcome to Silk Board, maga. It's 7:00 PM. Your flight from KIA boards at 9:10 PM. The endless river of red taillights stretches into the twilight haze. Auto drivers are quoting ₹800 flat. What's your move?",
      meme: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80"
    }
  ]);

  const [inputAction, setInputAction] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [turns, isThinking]);

  const formatTime = (totalMinutes) => {
    let hours = Math.floor(totalMinutes / 60);
    let mins = totalMinutes % 60;
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${mins < 10 ? '0' : ''}${mins} ${ampm}`;
  };

  const executeEngineAndNarrator = async (action) => {
    setIsThinking(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, state: gameState }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("API spike");
      }

      const data = await response.json();
      updateGameStateAndTurn(data.narration, data.timeDelta || 18, data.cashDelta || -80, data.batteryDelta || -8, data.newLocation, data.memeUrl);

    } catch (err) {
      generateRichFallback(action);
    } finally {
      setIsThinking(false);
    }
  };

  const generateRichFallback = (action) => {
    const lower = action.toLowerCase();
    let narration = "";
    let timeDelta = 18;
    let cashDelta = -60;
    let batteryDelta = -5;
    let newLoc = gameState.location;
    let memeUrl = null;

    if (lower.includes('airport') || lower.includes('kia') || lower.includes('auto') || lower.includes('cab')) {
      newLoc = "HSR Layout Flyover";
      narration = `The auto driver smokes a Beedi and says, "Sir, Silk Board is not a junction, it's an emotional state." After negotiation, you agree on ₹420 and squeeze through the chaotic service lane.`;
      cashDelta = -420;
      timeDelta = 22;
      memeUrl = "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&auto=format&fit=crop&q=80";
    } else if (lower.includes('metro') || lower.includes('train')) {
      newLoc = "Indiranagar Metro Station";
      narration = `You abandon the highway chaos, dodging BMTC buses and sprinting to the metro. Inside, techies are arguing about sprint velocity while you zoom past 8km of standstill traffic in 14 minutes!`;
      cashDelta = -60;
      timeDelta = 15;
      memeUrl = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80";
    } else if (lower.includes('walk') || lower.includes('run') || lower.includes('shortcut')) {
      newLoc = "Koramangala Inner Ring Road";
      narration = `Your local friend takes you through a 'shortcut' that turns out to be a waterlogged muddy lane. Your shoes are soaked, but you bypassed the main gridlock!`;
      batteryDelta = -12;
      timeDelta = 20;
      memeUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&auto=format&fit=crop&q=80";
    } else {
      narration = `You try "${action}". The Bengaluru evening rush answers with blaring horns and exhaust fumes. Time ticks forward by 18 minutes while you inch 200 meters closer to freedom.`;
      memeUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80";
    }

    updateGameStateAndTurn(narration, timeDelta, cashDelta, batteryDelta, newLoc, memeUrl);
  };

  const updateGameStateAndTurn = (narrationText, tDelta, cDelta, bDelta, loc, memeUrl) => {
    const newTime = gameState.timeMinutes + tDelta;
    const newCash = Math.max(0, gameState.cash + cDelta);
    const newBattery = Math.max(0, gameState.battery + bDelta);
    const updatedLocation = loc || gameState.location;

    setGameState(prev => ({
      ...prev,
      timeMinutes: newTime,
      cash: newCash,
      battery: newBattery,
      location: updatedLocation,
      gameOver: newTime >= 550 || newCash <= 0 || newBattery <= 0 || updatedLocation.includes("Airport") || updatedLocation.includes("KIA")
    }));

    setTurns(prev => [
      ...prev,
      { role: "player", text: inputAction },
      {
        role: "narrator",
        time: formatTime(newTime),
        location: updatedLocation,
        text: narrationText,
        meme: memeUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80"
      }
    ]);

    setInputAction("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputAction.trim() || gameState.gameOver) return;
    executeEngineAndNarrator(inputAction.trim());
  };

  const resetGame = () => {
    setGameState({
      timeMinutes: 420,
      location: "Silk Board Junction",
      cash: 1000,
      battery: 100,
      gameOver: false,
      statusMessage: "Flight from KIA boards at 9:10 PM."
    });
    setTurns([{
      role: "narrator",
      time: "7:00 PM",
      location: "Silk Board Junction",
      text: "Welcome to Silk Board, maga. It's 7:00 PM. Your flight from KIA boards at 9:10 PM. Red taillights stretch endlessly. What's your move?",
      meme: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80"
    }]);
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* Bengaluru Traffic Lane Image as the Chatting Screen Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
        <img 
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&auto=format&fit=crop&q=80" 
          alt="Bengaluru Highway Traffic" 
          className="w-full h-full object-cover filter brightness-[0.7] contrast-125 scale-105"
        />
        <div className={`absolute inset-0 transition-opacity duration-300 ${theme === 'dark' ? 'bg-slate-950/80' : 'bg-slate-100/75'} backdrop-blur-[3px]`}></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-4 w-full flex flex-col h-screen">
        
        {/* Top Header & HUD */}
        <header className={`p-4 rounded-3xl backdrop-blur-2xl border shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 transition-colors ${
          theme === 'dark' ? 'border-white/10 bg-slate-900/85 text-slate-100' : 'border-slate-300 bg-white/90 text-slate-900'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg text-slate-950 text-2xl font-black">
              🛺
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 via-orange-400 to-blue-400 bg-clip-text text-transparent">
                Silk Board Survival
              </h1>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Namma Bengaluru Traffic Edition • KIA Flight @ 9:10 PM</p>
            </div>
          </div>

          {/* HUD Status Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 w-full md:w-auto">
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-slate-950/80 text-slate-200' : 'border-slate-300 bg-slate-50 text-slate-800'}`}>
              <i className="fa-regular fa-clock text-blue-500 text-sm"></i>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Time</div>
                <div className="text-xs font-bold font-mono">{formatTime(gameState.timeMinutes)}</div>
              </div>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-slate-950/80 text-slate-200' : 'border-slate-300 bg-slate-50 text-slate-800'}`}>
              <i className="fa-solid fa-location-dot text-rose-500 text-sm"></i>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Location</div>
                <div className="text-xs font-bold truncate max-w-[100px]">{gameState.location}</div>
              </div>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-slate-950/80 text-slate-200' : 'border-slate-300 bg-slate-50 text-slate-800'}`}>
              <i className="fa-solid fa-wallet text-emerald-500 text-sm"></i>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Cash</div>
                <div className="text-xs font-bold font-mono text-emerald-500">₹{gameState.cash}</div>
              </div>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-slate-950/80 text-slate-200' : 'border-slate-300 bg-slate-50 text-slate-800'}`}>
              <i className="fa-solid fa-battery-three-quarters text-yellow-500 text-sm"></i>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Battery</div>
                <div className="text-xs font-bold font-mono text-yellow-500">{gameState.battery}%</div>
              </div>
            </div>
          </div>

          {/* Fully Working Light/Dark Theme Switcher */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`px-4 py-2.5 rounded-xl border font-semibold text-xs flex items-center gap-2 transition shadow-lg ${
                theme === 'dark' 
                  ? 'border-white/10 bg-slate-800 text-yellow-400 hover:bg-slate-700' 
                  : 'border-slate-300 bg-slate-200 text-slate-800 hover:bg-slate-300'
              }`}
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun text-amber-400' : 'fa-moon text-blue-600'}`}></i>
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </header>

        {/* Chat / Highway Narrative Scroll Body */}
        <main 
          ref={chatScrollRef}
          className="flex-1 my-3 overflow-y-auto space-y-6 px-3 pr-4 scroll-smooth"
        >
          {turns.map((turn, idx) => (
            <div key={idx} className={`space-y-2 ${turn.role === 'player' ? 'flex justify-end' : 'flex flex-col'}`}>
              {turn.role === 'player' ? (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-none shadow-2xl max-w-xl text-sm md:text-base font-bold transform transition hover:scale-[1.01] border border-blue-400/40">
                  <span className="opacity-75 mr-2">{'>'}</span> {turn.text}
                </div>
              ) : (
                <div className="space-y-2 max-w-2xl ml-2 md:ml-6">
                  <div className={`text-[10px] font-mono uppercase tracking-widest pl-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700 font-semibold'}`}>
                    NARRATOR • {turn.time} • {turn.location}
                  </div>
                  <div className={`p-5 rounded-3xl border shadow-2xl backdrop-blur-2xl relative ${
                    theme === 'dark' ? 'bg-slate-900/90 border-white/15 text-slate-100' : 'bg-white/90 border-slate-300 text-slate-900'
                  }`}>
                    <div className="absolute -left-3 top-5 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">AI</div>
                    <p className="leading-relaxed text-sm md:text-base mb-3 font-medium">{turn.text}</p>
                    {turn.meme && (
                      <div className={`mt-3 rounded-2xl overflow-hidden border shadow-xl ${theme === 'dark' ? 'border-white/10' : 'border-slate-300'}`}>
                        <img src={turn.meme} alt="Bengaluru Traffic Scene" className="w-full h-48 object-cover hover:scale-105 transition duration-500" />
                        <div className={`px-3 py-2 text-[11px] font-mono flex justify-between items-center ${theme === 'dark' ? 'bg-slate-950/90 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                          <span>📸 Live Traffic Cam: Silk Board Flyover</span>
                          <span className="text-amber-500 font-bold">#NammaBengaluruTraffic</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className={`flex items-center space-x-3 p-4 ml-6 text-sm font-mono animate-pulse rounded-2xl max-w-md border backdrop-blur-md ${
              theme === 'dark' ? 'bg-slate-900/70 border-white/10 text-slate-200' : 'bg-white/70 border-slate-300 text-slate-800'
            }`}>
              <i className="fa-solid fa-spinner animate-spin text-blue-500 text-lg"></i> Narrator & C++ Engine recalculating alternate flyover routes...
            </div>
          )}
        </main>

        {/* Action Input Footer */}
        <footer className={`p-4 rounded-3xl border backdrop-blur-2xl shrink-0 shadow-2xl mb-3 transition-colors ${
          theme === 'dark' ? 'border-white/15 bg-slate-900/85 text-slate-100' : 'border-slate-300 bg-white/90 text-slate-900'
        }`}>
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-mono font-bold text-lg">{'>'}</span>
              <input 
                type="text" 
                value={inputAction} 
                onChange={(e) => setInputAction(e.target.value)}
                placeholder="Type your move (e.g., 'bhaiya, airport chaloge? meter se' or 'Take metro')" 
                className={`w-full pl-11 pr-4 py-4 rounded-2xl border text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner transition ${
                  theme === 'dark' 
                    ? 'border-white/10 bg-slate-950 text-slate-100 placeholder-slate-400' 
                    : 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-500'
                }`}
                disabled={gameState.gameOver}
              />
            </div>
            <button 
              type="submit" 
              disabled={gameState.gameOver || isThinking}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-7 py-4 rounded-2xl font-bold shadow-xl transition flex items-center gap-2 active:scale-95 shrink-0 disabled:opacity-50 text-sm md:text-base"
            >
              <span>Move</span>
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </form>
          <div className={`flex items-center justify-between text-[11px] px-2 pt-2 font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            <span>🛡️ C++ Rule Validation & Bulletproof 503 Fallback Active</span>
            <span>Silk Board Escape v1.0</span>
          </div>
        </footer>

      </div>

      {/* Game Over / Victory Modal */}
      {gameState.gameOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-8 rounded-3xl max-w-md w-full border border-white/20 text-center space-y-6 shadow-2xl bg-slate-900 text-slate-100">
            <div className="text-6xl animate-bounce">
              {gameState.location.includes("Airport") || gameState.location.includes("KIA") ? "✈️" : "💀"}
            </div>
            <h2 className="text-2xl font-black">
              {gameState.location.includes("Airport") || gameState.location.includes("KIA") ? "Flight Boarded Successfully!" : "Shift Over: Flight Missed!"}
            </h2>
            <p className="text-sm text-slate-400">
              {gameState.location.includes("Airport") || gameState.location.includes("KIA") 
                ? "Legendary! You beat the Silk Board vortex and reached KIA before boarding closed." 
                : "Time expired or funds depleted while stuck at the exact same signal."}
            </p>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex justify-around text-xs font-mono">
              <div>Time: <span className="text-blue-400 font-bold">{formatTime(gameState.timeMinutes)}</span></div>
              <div>Cash: <span className="text-emerald-400 font-bold">₹{gameState.cash}</span></div>
              <div>Battery: <span className="text-yellow-400 font-bold">{gameState.battery}%</span></div>
            </div>
            <button 
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-2xl font-bold shadow-lg transition"
            >
              Play Another Shift
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
