"use client";

import {Search, X} from "lucide-react";
import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {Photo} from "../ui/Photo";
import {CheckCircle2} from "lucide-react";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function SuitabilityScreen({screen, go, back, search, setSearch, plantName, setPlantName, added, setAdded}:{screen: Screen; go: (s: Screen) => void; back: () => void; search: string; setSearch: (v: string) => void; plantName: string; setPlantName: (v: string) => void; added: boolean; setAdded: (v: boolean) => void}) {
  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
      <main className="flex-1 space-y-4 px-4 pb-6 pt-4">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3">
          <Search size={18} className="text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full py-3 text-sm outline-none" placeholder="Search a plant" />
          <button onClick={() => setSearch("")}><X size={16} /></button>
        </div>
        <Card className="flex items-center gap-3 p-3"><Photo label="Mango plant" height="h-20 w-24" emoji="🥭" /><div><b className="text-sm">{search || "Mango"}</b><p className="text-xs italic text-gray-500">Mangifera indica</p></div></Card>
        <Card className="p-4"><b className="text-sm">Suitability for your location</b>
          <div className="mt-4 flex items-center gap-5">
            <div className="grid h-24 w-24 place-items-center rounded-full border-[9px] border-[#d6efdc] border-t-[#087a43] text-xl font-bold text-green-800">89%</div>
            <div><p className="text-xs text-gray-500">Expected Yield</p><b className="text-lg text-green-700">High</b></div>
          </div>
        </Card>
        <Card className="p-4"><b className="text-sm">Why it may be suitable</b>{["Temperature within preferred range", "Rainfall is adequate", "Check soil type and drainage", "Confirm planting season locally"].map((t) => <p className="mt-3 flex gap-2 text-xs" key={t}><CheckCircle2 size={16} className="text-green-600" />{t}</p>)}</Card>
        <button onClick={() => {setPlantName(search || "Mango"); setAdded(true); go("care");}} className="w-full rounded-xl bg-[#087a43] py-3 text-sm font-bold text-white">Start Growing {search || "Mango"}</button>
      </main>
    </>
  );
}
