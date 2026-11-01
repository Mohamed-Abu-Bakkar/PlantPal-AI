import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return NextResponse.json({ error: "OPENWEATHER_API_KEY is not configured in Vercel." }, { status: 503 });
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));
  const city = req.nextUrl.searchParams.get("city");
  if ((!Number.isFinite(lat) || !Number.isFinite(lon)) && !city) return NextResponse.json({ error: "Provide coordinates or a city name." }, { status: 400 });
  const params = new URLSearchParams({ appid: key, units: "metric" });
  if (city) params.set("q", city); else { params.set("lat", String(lat)); params.set("lon", String(lon)); }
  try {
    const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`, { cache: "no-store" });
    const data = await r.json();
    if (!r.ok) return NextResponse.json({ error: data.message || "Weather lookup failed." }, { status: r.status });
    return NextResponse.json({ location: data.name, country: data.sys?.country, temperatureC: data.main?.temp, feelsLikeC: data.main?.feels_like, humidity: data.main?.humidity, windKmh: Math.round((data.wind?.speed || 0)*3.6), description: data.weather?.[0]?.description, icon: data.weather?.[0]?.icon, sunrise: data.sys?.sunrise, sunset: data.sys?.sunset });
  } catch { return NextResponse.json({ error: "Weather service is temporarily unavailable." }, { status: 502 }); }
}