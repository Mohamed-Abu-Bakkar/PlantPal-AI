"use client";

import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {Photo} from "../ui/Photo";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function HealthScreen({screen,go,back}:{screen:Screen;go:(s:Screen)=>void;back:()=>void}) {
  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES}/>
      <main className="flex-1 space-y-4 px-4 pb-6 pt-4">
        <Photo label="Plant leaf / issue photo" height="h-48" emoji="🍃"/>
        <Card className="p-4"><b className="text-sm">Plant health assessment</b><p className="mt-2 text-xs leading-5 text-gray-600">No health assessment has been run for this plant yet. The example diagnosis previously shown here was illustrative, not a result from your plant.</p><p className="mt-3 text-xs text-amber-700">Disease diagnosis from a photo is not currently connected. Do not treat a plant based on an example screen.</p></Card>
        <button onClick={()=>go("assistant")} className="w-full rounded-xl bg-[#087a43] py-3 text-sm font-bold text-white">Ask PlantPal about symptoms</button>
      </main>
    </>
  );
}