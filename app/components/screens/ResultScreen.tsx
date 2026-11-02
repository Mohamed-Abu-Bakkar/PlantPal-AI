"use client";

import {Leaf, Heart, ChevronRight} from "lucide-react";
import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {Photo} from "../ui/Photo";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function ResultScreen({screen, photoData, plantName, identifyResult, added, setAdded, go, back}:{screen: Screen; photoData: string; plantName: string; identifyResult: any; added: boolean; setAdded: (v: boolean) => void; go: (s: Screen) => void; back: () => void}) {
  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
      <main className="flex-1 space-y-4 px-4 pb-6 pt-4">
        {photoData ? <img src={photoData} alt="Uploaded plant" className="h-56 w-full rounded-2xl object-cover" /> : <Photo label="Identified plant image" height="h-56" emoji="🍅" />}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{plantName}</h1>
            <p className="mt-1 text-xs italic text-gray-500">{identifyResult?.scientificName || "Scientific name not confirmed"}</p>
          </div>
          <div className="rounded-xl bg-[#e9f5e9] px-3 py-2 text-center"><b className="text-lg text-[#087a43]">{identifyResult?.confidence != null ? identifyResult.confidence + "%" : "—"}</b><p className="text-[9px] text-gray-500">AI confidence</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card className="flex items-center gap-2 p-3"><Leaf className="text-green-600" /><div><p className="text-[10px] text-gray-500">Growth Stage</p><b className="text-xs">Flowering</b></div></Card>
          <Card className="flex items-center gap-2 p-3"><Heart className="text-green-600" /><div><p className="text-[10px] text-gray-500">Health Condition</p><b className="text-xs">Healthy</b></div></Card>
        </div>
        <Card className="p-4"><b className="text-sm">About this plant</b><p className="mt-2 text-xs leading-5 text-gray-600">{identifyResult?.visibleClues?.join("; ") || "Identification is an AI estimate. Compare the visible features with a trusted local plant guide."}</p>{identifyResult?.caveats?.length > 0 && <p className="mt-2 text-xs text-amber-700">{identifyResult.caveats.join(" ")}</p>}</Card>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => go("details")} className="rounded-xl bg-[#e0f0e2] py-3 text-xs font-bold text-[#087a43]">View Details</button>
          <button onClick={() => {setAdded(true); go("care");}} className="rounded-xl bg-[#087a43] py-3 text-xs font-bold text-white">{added ? "Added to My Plants" : "Add to My Plants"}</button>
        </div>
      </main>
    </>
  );
}
