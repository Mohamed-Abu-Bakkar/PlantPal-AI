import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ error: "GROQ_API_KEY is not configured in Vercel." }, { status: 503 });
  try {
    const { image } = await req.json();
    if (typeof image !== "string" || !image.startsWith("data:image/")) return NextResponse.json({ error: "Upload a valid plant image." }, { status: 400 });
    if (image.length > 8_000_000) return NextResponse.json({ error: "Image is too large. Please use an image under 6 MB." }, { status: 413 });
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", { method:"POST", headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"}, body:JSON.stringify({model:"qwen/qwen3.8-27b",temperature:0.2,max_completion_tokens:900,messages:[{role:"system",content:"You are a careful botanist helping home gardeners identify plants. Inspect the image and return ONLY valid JSON with keys commonName, scientificName, confidence (integer 0-100), visibleClues (array of strings), and caveats (array of strings). If the image is unclear or multiple plants are visible, state uncertainty. Do not claim disease diagnosis from this image."},{role:"user",content:[{type:"text",text:"Identify the main plant in this image. Return only the requested JSON."},{type:"image_url",image_url:{url:image}}]}]}) });
    const data=await r.json();
    if(!r.ok) return NextResponse.json({error:data.error?.message||"Plant identification failed."},{status:r.status});
    const raw=data.choices?.[0]?.message?.content||"";
    const match=raw.match(/\{[\s\S]*\}/);
    if(!match) return NextResponse.json({result:raw});
    try{return NextResponse.json({result:JSON.parse(match[0])});}catch{return NextResponse.json({result:raw});}
  } catch { return NextResponse.json({error:"Unable to identify this image."},{status:500}); }
}