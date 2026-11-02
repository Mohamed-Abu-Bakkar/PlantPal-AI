import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY;
  const weatherKey = process.env.OPENWEATHER_API_KEY;
  if (!groqKey || !weatherKey) return NextResponse.json({ error: "Plant care needs GROQ_API_KEY and OPENWEATHER_API_KEY configured in Vercel." }, { status: 503 });
  try {
    const body = await req.json();
    const plantName = typeof body.plantName === "string" ? body.plantName.trim().slice(0, 100) : "";
    const scientificName = typeof body.scientificName === "string" ? body.scientificName.trim().slice(0, 120) : "";
    const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 1200) : "";
    const city = typeof body.city === "string" ? body.city.trim().slice(0, 100) : "";
    const lat = Number(body.lat), lon = Number(body.lon);
    if (!plantName) return NextResponse.json({ error: "Plant name is required." }, { status: 400 });
    if (!city && (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat)>90 || Math.abs(lon)>180)) return NextResponse.json({ error: "Share your location or enter a city." }, { status: 400 });
    const params = new URLSearchParams({ appid: weatherKey, units: "metric" });
    if (city) params.set("q", city); else { params.set("lat", String(lat)); params.set("lon", String(lon)); }
    const base = "https://api.openweathermap.org/data/2.5/";
    const [currentRes, forecastRes] = await Promise.all([
      fetch(base+"weather?"+params.toString(), {cache:"no-store"}),
      fetch(base+"forecast?"+params.toString(), {cache:"no-store"})
    ]);
    const current = await currentRes.json(), forecast = await forecastRes.json();
    if (!currentRes.ok) return NextResponse.json({error:current.message||"Could not retrieve local weather."},{status:currentRes.status});
    if (!forecastRes.ok) return NextResponse.json({error:forecast.message||"Could not retrieve local forecast."},{status:forecastRes.status});
    const climate = {
      location:[current.name,current.sys?.state,current.sys?.country].filter(Boolean).join(", "),
      observedAt:new Date(current.dt*1000).toISOString(),
      timezoneOffsetSeconds:current.timezone,
      current:{temperatureC:current.main?.temp,humidityPercent:current.main?.humidity,conditions:current.weather?.[0]?.description,rainfall1hMm:current.rain?.["1h"]||0},
      forecast:(forecast.list||[]).slice(0,10).map((x:any)=>({time:x.dt_txt,temperatureC:x.main?.temp,humidityPercent:x.main?.humidity,rainProbability:x.pop,rainfall3hMm:x.rain?.["3h"]||0,conditions:x.weather?.[0]?.description}))
    };
    const prompt = [
      "Create a practical, locally relevant growing and care profile for a home gardener.",
      "Use reliable general horticultural knowledge for the plant and the supplied live weather and five-day forecast. Account for local date, likely season, heat, humidity and rain. Weather is short-term context, not long-term climate.",
      "Identify ambiguity in common names and use scientific name/identification notes when provided. Never invent soil test results or pretend to know the exact cultivar.",
      "For irrigation, specify suitable method, a practical frequency/rule based on soil moisture and weather, and technique. Avoid rigid watering schedules when conditions vary.",
      "For fertilizer, name a specific fertilizer formulation or commonly available product category the gardener can look for (not just "organic fertilizer"), give cautious NPK guidance only if defensible, growth-stage frequency, safe application method, and an organic alternative. If exact formulation depends on crop stage or soil test, give a sensible general option and explain the condition. Never invent a brand or exact dosage. Do not prescribe a precise dose without product concentration, pot/bed size and soil test; say to follow label dosage.",
      "Return ONLY JSON with this shape: {commonName:string,scientificName:string,summary:string,growingConditions:[{label:string,detail:string}],irrigation:{method:string,frequency:string,amount:string,seasonalAdjustment:string},fertilizer:{type:string,specificProduct:string,npk:string,frequency:string,application:string,organicAlternative:string},recommendations:string[],cautions:string[]}.",
      "Provide 4-6 growing conditions, 3-5 recommendations and any important uncertainty/cautions.",
      "Plant: "+plantName, "Scientific name: "+scientificName, "Existing identification notes: "+notes,
      "Local date: "+new Date().toISOString(), "Weather context: "+JSON.stringify(climate)
    ].join("\n\n");
    const ai = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:"POST",headers:{Authorization:"Bearer "+groqKey,"Content-Type":"application/json"},
      body:JSON.stringify({model:"openai/gpt-oss-20b",temperature:0.2,max_completion_tokens:1800,messages:[{role:"system",content:"You are a cautious horticulture specialist. Give safe, evidence-aware advice. Return only valid JSON."},{role:"user",content:prompt}]})
    });
    const aiData=await ai.json();
    if(!ai.ok)return NextResponse.json({error:aiData.error?.message||"Plant care generation failed."},{status:ai.status});
    const raw=aiData.choices?.[0]?.message?.content||"", match=raw.match(/\{[\s\S]*\}/);
    if(!match)return NextResponse.json({error:"The care service returned an unreadable result. Please try again."},{status:502});
    let result:any;
    try{result=JSON.parse(match[0]);}catch{return NextResponse.json({error:"The care service returned invalid details. Please try again."},{status:502});}
    if(!result.irrigation?.method||!result.fertilizer?.type||!result.fertilizer?.specificProduct||!Array.isArray(result.growingConditions)||!Array.isArray(result.recommendations))return NextResponse.json({error:"The generated care profile was incomplete. Please try again."},{status:502});
    return NextResponse.json({result,climate,contextNote:"Generated using the plant identification details, current local weather and a short-term forecast. Recommendations are estimates; verify soil and product-label requirements."});
  } catch { return NextResponse.json({error:"Unable to generate the local plant care profile."},{status:500}); }
}
