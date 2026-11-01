import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ error: "GROQ_API_KEY is not configured in Vercel." }, { status: 503 });
  try {
    const { image } = await req.json();
    if (typeof image !== "string" || !image.startsWith("data:image/")) return NextResponse.json({ error: "Upload a valid plant image." }, { status: 400 });
    if (image.length > 8_000_000) return NextResponse.json({ error: "Image is too large. Please use an image under 6 MB." }, { status: 413 });
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", { method:"POST", headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"}, body:JSON.stringify({model:"meta-llama/llama-4-scout-17b-16e-instruct",temperature:0.2,max_tokens:600,messages:[{role:"system",content:"Identify plants from images. Return concise JSON with commonName, scientificName, confidence (0-100), visibleClues, and caveats. If uncertain, say so. Do not diagnose disease with certainty."},{role:"user",content:[{type:"text",text:"Identify this plant. Return only JSON."},{type:"image_url",image_url:{url:image}}]}]}) });
    const data=await r.json();
    if(!r.ok) return NextResponse.json({error:data.error?.message||"Plant identification failed."},{status:r.status});
    const raw=data.choices?.[0]?.message?.content||"";
    const match=raw.match(/\{[\s\S]*\}/);
    if(!match) return NextResponse.json({result:raw});
    try{return NextResponse.json({result:JSON.parse(match[0])});}catch{return NextResponse.json({result:raw});}
  } catch { return NextResponse.json({error:"Unable to identify this image."},{status:500}); }
}