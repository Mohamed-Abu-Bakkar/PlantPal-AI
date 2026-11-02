import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY;
  const weatherKey = process.env.OPENWEATHER_API_KEY;
  if (!groqKey) return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 503 });
  if (!weatherKey) return NextResponse.json({ error: "OPENWEATHER_API_KEY is not configured." }, { status: 503 });

  try {
    const body = await req.json();
    const plantName = typeof body.plantName === "string" ? body.plantName.trim().slice(0, 100) : "";
    const city = typeof body.city === "string" ? body.city.trim().slice(0, 100) : "";
    const lat = Number(body.lat);
    const lon = Number(body.lon);
    if (!plantName) return NextResponse.json({ error: "Enter a plant name." }, { status: 400 });
    if (!city && (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180)) {
      return NextResponse.json({ error: "Share your location or enter a city." }, { status: 400 });
    }

    const params = new URLSearchParams({ appid: weatherKey, units: "metric" });
    if (city) params.set("q", city); else { params.set("lat", String(lat)); params.set("lon", String(lon)); }
    const base = "https://api.openweathermap.org/data/2.5/";
    const [currentRes, forecastRes] = await Promise.all([
      fetch(base + "weather?" + params.toString(), { cache: "no-store" }),
      fetch(base + "forecast?" + params.toString(), { cache: "no-store" })
    ]);
    const current = await currentRes.json();
    const forecast = await forecastRes.json();
    if (!currentRes.ok) return NextResponse.json({ error: current.message || "Could not find weather for that location." }, { status: currentRes.status });
    if (!forecastRes.ok) return NextResponse.json({ error: forecast.message || "Could not load the weather forecast." }, { status: forecastRes.status });

    const climate = {
      location: [current.name, current.sys?.state, current.sys?.country].filter(Boolean).join(", "),
      coordinates: { lat: current.coord?.lat, lon: current.coord?.lon },
      timezoneOffsetSeconds: current.timezone,
      observedAt: new Date(current.dt * 1000).toISOString(),
      current: { temperatureC: current.main?.temp, feelsLikeC: current.main?.feels_like, humidityPercent: current.main?.humidity, windKmh: Math.round((current.wind?.speed || 0) * 3.6), conditions: current.weather?.[0]?.description },
      forecastNextFiveDays: (forecast.list || []).filter((_: unknown, i: number) => i % 2 === 0).slice(0, 10).map((item: any) => ({
        time: item.dt_txt, temperatureC: item.main?.temp, humidityPercent: item.main?.humidity,
        rainProbability: item.pop, rainfall3hMm: item.rain?.["3h"] || 0, conditions: item.weather?.[0]?.description
      }))
    };

    const prompt = [
      "Assess whether a home gardener can grow the requested plant in this location at this time.",
      "Use botanical growing requirements and the supplied current weather and 5-day forecast. Consider the local calendar date and season; do not equate a short forecast with long-term climate.",
      "Do not invent soil test results, exact rainfall climatology, frost dates, or certainty. If species ambiguity matters, state the assumption or ask for clarification in caveats.",
      "Return ONLY valid JSON with this exact shape:",
      '{"score":0,"verdict":"Good fit | Possible with care | Not recommended now","summary":"...","bestPlantingWindow":"...","factors":[{"label":"Temperature","status":"good | caution | poor | unknown","detail":"..."}],"recommendations":["..."],"caveats":["..."]}',
      "Score is a cautious 0-100 estimate of current planting suitability, not a guarantee. Explain if key information such as soil type, sunlight, cultivar or local climate normals is missing. Use 3-5 factors and 2-4 actionable recommendations.",
      "Plant: " + plantName,
      "Local date: " + new Date().toISOString(),
      "Location and weather JSON: " + JSON.stringify(climate)
    ].join("\n\n");

    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b", temperature: 0.2, max_completion_tokens: 1400,
        messages: [{ role: "system", content: "You are a cautious horticulture advisor. Never present a guess as measured fact. Output only valid JSON." }, { role: "user", content: prompt }]
      })
    });
    const aiData = await aiRes.json();
    if (!aiRes.ok) return NextResponse.json({ error: aiData.error?.message || "Suitability analysis failed." }, { status: aiRes.status });
    const raw = aiData.choices?.[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "The analysis service returned an unreadable result. Please try again." }, { status: 502 });
    let result;
    try { result = JSON.parse(match[0]); } catch { return NextResponse.json({ error: "The analysis service returned an invalid result. Please try again." }, { status: 502 }); }
    if (typeof result.score !== "number" || !Array.isArray(result.factors) || !Array.isArray(result.recommendations)) {
      return NextResponse.json({ error: "The analysis result was incomplete. Please try again." }, { status: 502 });
    }
    result.score = Math.max(0, Math.min(100, Math.round(result.score)));
    return NextResponse.json({ result, climate });
  } catch {
    return NextResponse.json({ error: "Unable to complete the suitability check." }, { status: 500 });
  }
}
