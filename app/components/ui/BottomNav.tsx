"use client";

import {Bell, Flower2, House, ShoppingCart} from "lucide-react";
import type { Screen } from "../shared/types";

const NAV_ITEMS = [
  {s: "home" as Screen, l: "Home", i: House},
  {s: "plants" as Screen, l: "My Plants", i: Flower2},
  {s: "alerts" as Screen, l: "Alerts", i: Bell},
  {s: "store" as Screen, l: "Store", i: ShoppingCart},
];

export function BottomNav({screen, go}:{screen: Screen; go: (s: Screen) => void}) {
  return (
    <nav className="sticky bottom-0 z-20 grid h-[66px] grid-cols-4 border-t border-[#e7eee5] bg-white/95 px-2 backdrop-blur">
      {NAV_ITEMS.map((x) => (
        <button
          key={x.s}
          onClick={() => go(x.s)}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] ${screen === x.s ? "font-bold text-[#087a43]" : "text-[#8a968e]"}`}
        >
          <x.i size={19} />
          {x.l}
        </button>
      ))}
    </nav>
  );
}
