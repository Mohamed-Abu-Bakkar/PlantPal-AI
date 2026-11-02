"use client";

import {Header} from "../ui/Header";
import {Pill} from "../ui/Pill";
import {Card} from "../ui/Card";
import {BottomNav} from "../ui/BottomNav";
import {products} from "../shared/data";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function StoreScreen({screen, go, back, storeTab, setStoreTab, cartCount, setCartCount}:{screen: Screen; go: (s: Screen) => void; back: () => void; storeTab: string; setStoreTab: (v: string) => void; cartCount: number; setCartCount: (v: number) => void}) {
  return (
    <>
      <Header backable={false} screen={screen} go={go} back={back} cartCount={cartCount} title={SCREEN_TITLES} />
      <main className="flex-1 px-4 pb-5 pt-4">
        <div className="mb-4 flex gap-2 overflow-x-auto">{["Fertilizers", "Seeds", "Tools", "Pesticides"].map((t) => <Pill key={t} active={storeTab === t} onClick={() => setStoreTab(t)}>{t}</Pill>)}</div>
        <div className="space-y-3">
          {(storeTab === "Fertilizers" ? products : storeTab === "Seeds" ? [["Tomato Seeds", "Hybrid high-yield variety", "₹ 120", "🍅"], ["Spinach Seeds", "Fast-growing leafy greens", "₹ 80", "🥬"]] : storeTab === "Tools" ? [["Garden Hand Trowel", "Stainless steel tool", "₹ 199", "🛠️"], ["Watering Can", "Indoor and outdoor use", "₹ 249", "🚿"]] : [["Neem Oil", "Organic garden care", "₹ 150", "🧴"], ["Sticky Traps", "Monitor flying pests", "₹ 99", "🟨"]]).map((p, i) => <Card key={i} className="flex items-center gap-3 p-3"><div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-[#f1f5ee] text-4xl">{p[3]}</div><div className="min-w-0 flex-1"><b className="text-xs">{p[0]}</b><p className="mt-1 text-[10px] text-gray-500">{p[1]}</p><b className="mt-2 block text-xs">{p[2]}</b></div><button onClick={() => {setCartCount(cartCount + 1); alert("Added to your garden cart.");}} className="rounded-lg bg-[#087a43] px-3 py-2 text-[11px] font-bold text-white">Add</button></Card>)}
        </div>
      </main>
      <BottomNav screen={screen} go={go} />
    </>
  );
}
