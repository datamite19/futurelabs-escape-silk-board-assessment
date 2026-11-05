return NextResponse.json({
  text: data.text || "You weave through the traffic and move closer to the airport.",
  timeMinutes: data.timeMinutes || gameState.timeMinutes + 15,
  location: data.location || "Outer Ring Road",
  cash: data.cash ?? Math.max(0, gameState.cash - 50),
  battery: data.battery ?? Math.max(0, gameState.battery - 5),
  meme: data.meme || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
  gameOver: data.gameOver || false
});
