# Silk Board Survival: Catch the Flight 🚦✈️

An interactive, AI-driven, text-based survival game where the objective is simple but the reality is brutal: You are stuck at Bengaluru's infamous Silk Board Junction at 7:00 PM, and you must make it to Bengaluru International Airport before your flight boarding closes at 9:10 PM.

## 🚀 Features
*   **C++23 Game Engine:** A highly strict, non-negotiable C++ backend enforces time, money, battery life, and route validation. No teleportation allowed!
*   **Gemini AI Narrator:** The storyteller is a witty, sarcastic Bengaluru local powered by Google Gemini, processing your inputs and spinning a hilarious narrative.
*   **Dynamic Meme Delivery:** The AI automatically scans conversational context and injects custom SVGs (20 original memes) into the iMessage-inspired UI.
*   **Next.js Frontend:** A beautiful, responsive chat interface mimicking a mobile messaging app, built with Tailwind CSS.

## 📁 Directory Structure
*   `/backend/cpp-engine/` - The authoritative C++ rules engine and HTTP server.
*   `/frontend/` - The Next.js React user interface and API proxy.
*   `/data/` - Slang dictionaries and mock trend data.
*   `/docs/` - Comprehensive guides to the architecture and deployment.

## 🛠️ Tech Stack
*   **Frontend:** Next.js 14, React, Tailwind CSS, TypeScript
*   **Backend Engine:** C++23, CMake, cpp-httplib, GoogleTest
*   **AI:** Google Gemini API (`gemini-1.5-flash`)
*   **Assets:** Original SVGs dynamically routed via JSON manifests.

## 📜 Getting Started
Check out `BEGINNER_RUN_GUIDE.md` for dead-simple instructions on how to get this running on your local machine in under 5 minutes!