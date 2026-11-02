"use client";

import {Activity, CalendarDays, CloudSun} from "lucide-react";
import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {Row} from "../ui/Row";
import {Photo} from "../ui/Photo";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function DetailsScreen({screen, go, back, plantName, added, setAdded}:{screen: Screen; go: (s: Screen) => void; back: () => void; plantName: string; added: boolean; setAdded: (v: boolean) => void}) {
  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
      <main className="flex-1 space-y-4 px-4 pb-6 pt-4">
        <Photo label="Plant detail image" height="h-56" emoji="🍅" />
        <h2 className="text-xl font-bold">{plantName}</h2>
        <Card className="p-4"><b className="text-sm">Plant profile</b><p className="mt-2 text-xs leading-5 text-gray-600">Warm-season plant that generally needs plenty of sunlight, consistent moisture and well-drained soil.</p></Card>
        <Row icon={Activity} title="Plant Health" desc="Inspect leaves and identify possible issues" onClick={() => go("health")} />
        <Row icon={CalendarDays} title="Care Guide" desc="Watering, fertilizer and sunlight" onClick={() => go("care")} />
        <Row icon={CloudSun} title="Local Weather" desc="Weather context for your garden" onClick={() => go("weather")} />
        <button onClick={() => setAdded(!added)} className="w-full rounded-xl bg-[#087a43] py-3 text-sm font-bold text-white">{added ? "Remove from My Plants" : "Add to My Plants"}</button>
      </main>
    </>
  );
}
