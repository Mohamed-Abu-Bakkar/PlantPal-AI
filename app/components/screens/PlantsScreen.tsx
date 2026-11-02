"use client";

import {Plus, ChevronRight} from "lucide-react";
import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {Photo} from "../ui/Photo";
import {BottomNav} from "../ui/BottomNav";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function PlantsScreen({screen, go, back, plantName, setPlantName}:{screen: Screen; go: (s: Screen) => void; back: () => void; plantName: string; setPlantName: (v: string) => void}) {
  return (
    <>
      <Header backable={false} screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
      <main className="flex-1 space-y-3 px-4 pb-5 pt-4">
        <div className="flex items-center justify-between">
          <div><b className="text-lg">My Plants</b><p className="text-xs text-gray-500">Your growing collection</p></div>
          <button onClick={() => go("scanner")} className="flex items-center gap-1 rounded-xl bg-[#087a43] px-3 py-2 text-xs font-bold text-white"><Plus size={15} /> Add</button>
        </div>
        {["Tomato", "Spinach"].map((p, i) => <button key={p} onClick={() => {setPlantName(p); go("care");}} className="w-full text-left"><Card className="flex items-center gap-3 p-3"><Photo label={p} height="h-20 w-24" emoji={i ? "🥬" : "🍅"} /><div className="flex-1"><b className="text-sm">{p}</b><p className="text-xs text-gray-500">{i ? "Vegetative" : "Flowering"} Stage</p><p className="mt-1 text-[10px] font-semibold text-green-700">● Healthy</p></div><ChevronRight size={18} className="text-gray-400" /></Card></button>)}
      </main>
      <BottomNav screen={screen} go={go} />
    </>
  );
}
