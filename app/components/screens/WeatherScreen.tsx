"use client";

import {MapPin, Sun, CloudRain, Lightbulb} from "lucide-react";
import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function WeatherScreen({screen, go, back, weather, weatherLoading, serviceError, loadWeather}:{screen: Screen; go: (s: Screen) => void; back: () => void; weather: any; weatherLoading: boolean; serviceError: string; loadWeather: () => void}) {
  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
      <main className="flex-1 space-y-4 px-4 pb-6 pt-4">
        {serviceError && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{serviceError}</p>}
        <Card className="flex gap-3 p-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e7f5e8] text-green-700"><MapPin size={28} /></div>
          <div className="min-w-0 flex-1">
            <b className="text-sm">{weather?.location ? weather.location + ", " + (weather.country || "") : "Your location"}</b>
            <p className="text-xs text-gray-500">{weather ? "Live weather loaded" : "Allow location access for local weather"}</p>
            <p className="text-[10px] text-gray-500">Location is requested only when you refresh.</p>
          </div>
          <button onClick={loadWeather} disabled={weatherLoading} className="rounded-lg bg-[#087a43] px-3 py-2 text-[10px] font-bold text-white">{weatherLoading ? "Loading…" : "Refresh"}</button>
        </Card>
        <div className="flex justify-between"><b className="text-sm">Current Weather</b><span className="text-[10px] text-gray-400">Current conditions</span></div>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center"><Sun size={34} className="mx-auto text-amber-500" /><b className="mt-2 block text-2xl">{weather ? Math.round(weather.temperatureC) + "°C" : "--°C"}</b><p className="text-xs capitalize text-gray-500">{weather?.description || "Live weather not loaded"}</p></div>
            <div className="h-20 border-l border-gray-100" />
            <div className="flex-1 space-y-2 text-xs"><p>Humidity <b className="float-right">{weather ? weather.humidity + "%" : "--"}</b></p><p>Wind Speed <b className="float-right">{weather ? weather.windKmh + " km/h" : "--"}</b></p><p>Feels like <b className="float-right">{weather ? Math.round(weather.feelsLikeC) + "°C" : "--"}</b></p></div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 bg-[#e9f6ff] p-4"><CloudRain size={32} className="text-blue-500" /><div><b className="text-xs">Rain forecast</b><p className="text-[11px] text-gray-600">{weather ? "Current conditions loaded from OpenWeather." : "Tap Refresh to load current local weather."}</p></div></Card>
        <Card className="bg-[#fff8df] p-4"><div className="flex gap-2"><Lightbulb className="text-amber-500" /><b className="text-sm">AI Recommendation</b></div><p className="mt-2 text-xs leading-5 text-gray-700">{weather ? "It is " + Math.round(weather.temperatureC) + "°C with " + weather.humidity + "% humidity. Check topsoil before watering; weather alone cannot measure soil moisture." : "Refresh weather to receive a location-aware care note."}</p></Card>
      </main>
    </>
  );
}
