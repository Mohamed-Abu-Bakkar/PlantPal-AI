import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) return NextResponse.json({ error: "GROQ_API_KEY is not configured in Vercel." }, { status: 503 });
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (!messages.length || messages.length > 20) return NextResponse.json({ error: "Send between 1 and 20 chat messages." }, { status: 400 });
    const safeMessages = messages.map((m: any) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 4000) }));
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", temperature: 0.35, max_tokens: 700, messages: [
        { role: "system", content: "You are PlantPal AI, a cautious gardening assistant for beginners and home gardeners. Give practical, clear plant-care guidance. Ask for plant species, location, and growing conditions when important. Do not claim certainty from insufficient information. Do not invent soil nutrient measurements or exact fertilizer dosages. For suspected disease, explain uncertainty and recommend confirming symptoms before treatment. Keep answers concise and friendly." },
        ...safeMessages
      ] })
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.error?.message || "AI provider request failed." }, { status: response.status });
    return NextResponse.json({ reply: data.choices?.[0]?.message?.content || "I couldn't generate a reply. Please try again." });
  } catch { return NextResponse.json({ error: "Unable to process the AI request." }, { status: 500 }); }
}