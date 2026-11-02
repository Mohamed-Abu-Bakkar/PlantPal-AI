"use client";

import {ArrowLeft, Bell, Menu, ShoppingCart} from "lucide-react";
import type { Screen } from "../shared/types";

export function Header({backable = true, screen, go, back, cartCount, title}:{backable?: boolean; screen: Screen; go: (s: Screen) => void; back: () => void; cartCount: number; title: Record<Screen, string>}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#e9eee7] bg-[#fbfcf8]/95 px-4 backdrop-blur">
      <button onClick={() => (backable ? back() : go("home"))} className="grid h-9 w-8 place-items-center text-[#193b29]">
        {backable ? <ArrowLeft size={21} /> : <Menu size={21} />}
      </button>
      <b className="text-[15px] text-[#17271d]">{title[screen]}</b>
      <button
        onClick={() => (screen === "store" ? alert(cartCount ? `Your garden cart has ${cartCount} item(s). Checkout is not enabled yet.` : "Your garden cart is empty.") : go("alerts"))}
        aria-label={screen === "store" ? "View garden cart" : "Open alerts"}
        className="relative grid h-9 w-8 place-items-center text-[#164c2e]"
      >
        {screen === "store" ? <ShoppingCart size={20} /> : <Bell size={20} />}
        {screen === "store" && cartCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">{cartCount}</span>
        )}
      </button>
    </header>
  );
}
