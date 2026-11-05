# Design & Architecture - Silk Board Survival

## Overview
Silk Board Survival is an interactive, AI-narrated survival game designed to test quick decision-making under the immense pressure of Bengaluru's notorious traffic gridlock.

## Architecture & Flow
1. **Frontend (`app/page.tsx`)**: 
   - Manages local game state (`timeMinutes`, `location`, `cash`, `battery`, `gameOver`).
   - Renders an immersive HUD tracking time, location, currency, and phone battery.
   - Sends user actions and current game state via a `POST` request to the backend API route.
2. **Backend API Route (`app/api/chat/route.ts`)**:
   - Acts as the serverless bridge to Google Gemini.
   - Dynamically constructs prompts containing the current game state and player action.
   - Enforces strict JSON response formats from the model to seamlessly update game stats and narrative text.
   - Implements robust error handling and local fallbacks.

## Key Design Decisions
- **Serverless Initialization**: Initializing the Gemini SDK inside the request handler ensures secure environment variable bindings on Vercel without cold-start failures.
- **Dynamic HUD Feedback**: Every player choice affects time progression, battery drain, and wallet cash, driving high stakes toward the 9:10 PM flight deadline.
