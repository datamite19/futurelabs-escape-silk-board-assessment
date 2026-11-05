# Silk Board Survival - Namma Bengaluru Traffic Edition

A gritty, witty, text-based survival web application where players attempt to escape the infamous Silk Board Junction gridlock in Bengaluru and reach Kempegowda International Airport (KIA) before their flight departure.

## Live Demo & Walkthrough
- **Live App URL**: [https://futurelabs-escape-silk-board-assess-six.vercel.app](https://futurelabs-escape-silk-board-assess-six.vercel.app)
- **Video Walkthrough (Loom)**: [Watch the Loom Video](https://www.loom.com/share/1d94d00da9a74a8dbb321ce41f2cec39)

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons
- **AI Integration**: Google Gen AI SDK (`@google/generative-ai`), Gemini 1.5 / 3.5 Flash
- **Hosting & Deployment**: Vercel

## Environment Variables Setup
To run or deploy this project, configure the following environment variable in Vercel or your local `.env` file:
- `GEMINI_API_KEY`: Your Google Gemini API key.
- `GEMINI_MODEL`: `gemini-3.5-flash-lite` (or `gemini-1.5-flash`)
