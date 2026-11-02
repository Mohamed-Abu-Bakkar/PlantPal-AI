"use client";

import {Droplets, Sprout, Sun, Activity, ThermometerSun, CalendarDays, ChevronRight} from "lucide-react";
import {Header} from "../ui/Header";
import {Pill} from "../ui/Pill";
import {Card} from "../ui/Card";
import {Row} from "../ui/Row";
import {Photo} from "../ui/Photo";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function CareScreen({screen, go, back, careTab, setCareTab}:{screen: Screen; go: (s: Screen) => void; back: () => void; careTab: string; setCareTab: (v: string) => void}) {
  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
      <main className="flex-1 px-3 pb-6 pt-3">
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {["Overview", "Care Schedule", "Growth"].map((t) => <Pill key={t} active={careTab === t} onClick={() => setCareTab(t)}>{t}</Pill>)}
        </div>
        {careTab === "Overview" ? (
          <Card className="overflow-hidden">
            {[[Droplets, "Watering", "Every 3–4 days"], [Sprout, "Fertilizer", "Apply in 2 days"], [Sun, "Sunlight", "6–8 hours daily"], [Activity, "Soil", "Well-drained, pH 6.0–6.8"], [ThermometerSun, "Temperature", "Ideal: 20–30°C"], [Sprout, "Expected Harvest", "In 40–45 days"]].map((item: any) => {
              const [I, t, d] = item;
              return <Row key={t} icon={I} title={t} desc={d} onClick={() => go("assistant")} />;
            })}
          </Card>
        ) : careTab === "Care Schedule" ? (
          <Card className="p-4"><b className="text-sm">Upcoming care schedule</b>{["Today · Check soil moisture", "In 2 days · Fertilizer check", "In 3 days · Water if soil is dry", "Next week · Inspect leaves"].map((t) => <div className="mt-4 flex gap-3 text-xs" key={t}><CalendarDays className="text-green-600" size={18} />{t}</div>)}</Card>
        ) : (
          <Card className="p-4"><b className="text-sm">Growth journey</b><Photo label="Growth stage photo" height="h-40" emoji="🌱" /><p className="mt-3 text-xs text-gray-600">Current stage: Flowering</p><p className="mt-1 text-xs text-gray-600">Estimated harvest: 40–45 days, depending on variety and conditions.</p></Card>
        )}
        <Card className="mt-3 flex items-center gap-3 bg-[#e8f5e9] p-4"><span className="text-2xl">🌼</span><div className="flex-1"><b className="text-xs">Flowering expected soon</b><p className="text-[11px] text-gray-600">Keep monitoring plant health and soil moisture.</p></div><ChevronRight className="text-green-700" /></Card>
      </main>
    </>
  );
}
