# PlantPal AI 🌱

**Everyone, Anywhere Can Plant.**

PlantPal AI is a beginner-friendly gardening companion. This starter uses Next.js 14, React 18, TypeScript, Tailwind CSS 3 and Convex.

## Getting started

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Run `npx convex dev` and configure a cloud deployment.
5. Set `NEXT_PUBLIC_CONVEX_URL` from the Convex deployment URL.
6. Add `GROQ_API_KEY` and `OPENWEATHER_API_KEY` as server-side secrets in your deployment environment (never expose them with NEXT_PUBLIC_).
7. Run `npm run dev`.

## Notes

Weather and AI credentials are intentionally not included. Sensor readings and AI-generated care suggestions should be treated as decision support, not as laboratory soil analysis or guaranteed fertilizer prescriptions.
