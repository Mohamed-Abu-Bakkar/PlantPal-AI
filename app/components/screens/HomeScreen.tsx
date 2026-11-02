"use client";

import {Menu, Bell, Camera, Leaf, MapPin, CloudSun, ShoppingCart, Sparkles} from "lucide-react";
import {Tile} from "../ui/Tile";
import {Card} from "../ui/Card";
import {Photo} from "../ui/Photo";
import type {Screen} from "../shared/types";

export function HomeScreen({go, plantName, setPlantName, added, setAdded}:{go: (s: Screen) => void; plantName: string; setPlantName: (v: string) => void; added: boolean; setAdded: (v: boolean) => void}) {
  return (
    <>
      <header className="flex h-14 items-center justify-between px-4">
        <button onClick={() => go("plants")}><Menu /></button>
        <b className="text-[16px]">PlantPal AI</b>
        <button onClick={() => go("alerts")}><Bell /></button>
      </header>
      <main className="flex-1 space-y-5 px-4 pb-5">
        <div className="pt-2">
          <h1 className="text-[21px] font-bold">Good Morning!</h1>
          <p className="mt-1 text-xs text-[#647568]">Let's take care of your plants today.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Tile Icon={Camera} label="Identify Plant" onClick={() => go("scanner")} />
          <Tile Icon={Leaf} label="My Plants" onClick={() => go("plants")} />
          <Tile Icon={MapPin} label="Check Suitability" onClick={() => go("suitability")} />
          <Tile Icon={CloudSun} label="Weather" onClick={() => go("weather")} color="text-amber-500" />
          <Tile Icon={ShoppingCart} label="Buy Supplies" onClick={() => go("store")} />
          <Tile Icon={Sparkles} label="AI Assistant" onClick={() => go("assistant")} />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">My Plants</h2>
            <button onClick={() => go("plants")} className="text-xs font-semibold text-[#087a43]">See All →</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => {setPlantName("Tomato"); go("care");}} className="overflow-hidden rounded-2xl border border-[#e5ece3] bg-white text-left shadow-sm">
              <img src="/tomato-plant.png" alt="Tomato plant" className="h-24 w-full object-cover" />
              <div className="p-3">
                <b className="text-xs">Tomato</b>
                <p className="text-[10px] text-gray-500">Flowering Stage</p>
                <p className="mt-1 text-[10px] font-semibold text-green-700">● Healthy</p>
              </div>
            </button>
            <button onClick={() => {setPlantName("Spinach"); go("care");}} className="overflow-hidden rounded-2xl border border-[#e5ece3] bg-white text-left shadow-sm">
              <img src="/spinach-palnt.png" alt="Spinach plant" className="h-24 w-full object-cover" />
              <div className="p-3">
                <b className="text-xs">Spinach</b>
                <p className="text-[10px] text-gray-500">Vegetative Stage</p>
                <p className="mt-1 text-[10px] font-semibold text-green-700">● Healthy</p>
              </div>
            </button>
          </div>
        </div>
        <Card className="p-4">
          <div className="flex items-center justify-between"><b className="text-sm">Today's garden tip</b><Sparkles size={18} className="text-[#13864a]" /></div>
          <p className="mt-2 text-xs leading-5 text-[#68766b]">Check the soil before watering. The top layer drying out is a useful first clue, but each plant has different needs.</p>
          <button onClick={() => go("assistant")} className="mt-3 text-xs font-bold text-[#087a43]">Ask PlantPal →</button>
        </Card>
      </main>
    </>
  );
}
