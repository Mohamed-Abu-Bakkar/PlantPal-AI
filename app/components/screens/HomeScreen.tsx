"use client";

import { useState } from "react";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Menu, Bell, Camera, Leaf, MapPin, CloudSun, ShoppingCart, Sparkles, X, UserRound, Settings, LogIn, UserPlus, LogOut, CircleHelp } from "lucide-react";
import { Tile } from "../ui/Tile";
import { Card } from "../ui/Card";
import type { Screen } from "../shared/types";

export function HomeScreen({go, plantName, setPlantName, added, setAdded}:{go: (s: Screen) => void; plantName: string; setPlantName: (v: string) => void; added: boolean; setAdded: (v: boolean) => void}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const plants = useQuery(api.plants.list, isLoaded && isSignedIn ? {} : "skip");
  const navigate = (screen: Screen) => { setMenuOpen(false); go(screen); };

  return (
    <>
      <header className="flex h-14 items-center justify-between px-4">
        <button aria-label="Open navigation menu" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 hover:bg-[#edf4ec]"><Menu /></button>
        <b className="text-[16px]">PlantPal AI</b>
        <button aria-label="Notifications" onClick={() => go("alerts")} className="rounded-lg p-2 hover:bg-[#edf4ec]"><Bell /></button>
      </header>
      {menuOpen && <div className="fixed inset-0 z-50 flex justify-start bg-black/40" onClick={() => setMenuOpen(false)}>
        <aside className="flex h-full w-[min(86vw,340px)] flex-col bg-[#fbfcf8] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()} aria-label="Main navigation">
          <div className="mb-6 flex items-center justify-between"><div><p className="text-lg font-bold text-[#087a43]">PlantPal AI</p><p className="text-xs text-[#647568]">Everyone, Anywhere Can Plant</p></div><button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="rounded-lg p-2 hover:bg-[#edf4ec]"><X /></button></div>
          {isLoaded && isSignedIn ? <div className="mb-5 rounded-2xl border border-[#e5ece3] bg-white p-3"><p className="text-sm font-semibold">{user?.fullName || user?.firstName || "PlantPal member"}</p><p className="mt-1 truncate text-xs text-[#647568]">{user?.primaryEmailAddress?.emailAddress}</p></div> : <div className="mb-5 rounded-2xl border border-[#e5ece3] bg-white p-3 text-sm text-[#647568]">{isLoaded ? "Sign in to save your garden and preferences." : "Loading account…"}</div>}
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#829084]">Your garden</p>
          <nav className="space-y-1">
            <button onClick={() => navigate("plants")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-[#edf4ec]"><Leaf size={18}/> My Plants</button>
            <button onClick={() => navigate("alerts")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-[#edf4ec]"><Bell size={18}/> Reminders & Notifications</button>
            <button onClick={() => navigate("weather")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-[#edf4ec]"><CloudSun size={18}/> Local Weather</button>
            <button onClick={() => navigate("assistant")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-[#edf4ec]"><Sparkles size={18}/> Ask PlantPal</button>
          </nav>
          <p className="mb-2 mt-6 text-[10px] font-bold uppercase tracking-wider text-[#829084]">Account</p>
          <nav className="space-y-1">
            {isLoaded && isSignedIn ? <>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-[#edf4ec]"><UserRound size={18}/> Profile</Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-[#edf4ec]"><Settings size={18}/> Account Settings</Link>
              <button onClick={() => signOut({ redirectUrl: "/" })} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-700 hover:bg-red-50"><LogOut size={18}/> Sign out</button>
            </> : isLoaded ? <>
              <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-[#edf4ec]"><LogIn size={18}/> Sign in</Link>
              <Link href="/sign-up" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-[#edf4ec]"><UserPlus size={18}/> Create account</Link>
            </> : null}
            <button onClick={() => navigate("assistant")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-[#edf4ec]"><CircleHelp size={18}/> Help & Support</button>
          </nav>
          <div className="mt-auto border-t border-[#e5ece3] pt-4 text-[11px] text-[#829084]">PlantPal AI · Grow with confidence</div>
        </aside>
      </div>}
      <main className="flex-1 space-y-5 px-4 pb-5">
        <div className="pt-2"><h1 className="text-[21px] font-bold">Good Morning!</h1><p className="mt-1 text-xs text-[#647568]">Let's take care of your plants today.</p></div>
        <div className="grid grid-cols-3 gap-3">
          <Tile Icon={Camera} label="Identify Plant" onClick={() => go("scanner")} />
          <Tile Icon={Leaf} label="My Plants" onClick={() => go("plants")} />
          <Tile Icon={MapPin} label="Check Suitability" onClick={() => go("suitability")} />
          <Tile Icon={CloudSun} label="Weather" onClick={() => go("weather")} color="text-amber-500" />
          <Tile Icon={ShoppingCart} label="Buy Supplies" onClick={() => go("store")} />
          <Tile Icon={Sparkles} label="AI Assistant" onClick={() => go("assistant")} />
        </div>
        <div><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">My Plants</h2><button onClick={() => go("plants")} className="text-xs font-semibold text-[#087a43]">See All →</button></div>
          {!isLoaded || (isSignedIn && plants === undefined) ? <p className="text-xs text-gray-500">Loading your garden…</p> : !isSignedIn ? <Card className="p-4 text-xs text-gray-600">Sign in to view plants saved to your account.</Card> : plants?.length ? <div className="grid grid-cols-2 gap-3">{plants.slice(0,4).map((plant) => <button key={plant._id} onClick={() => {setPlantName(plant.name); go("care");}} className="rounded-2xl border border-[#e5ece3] bg-white p-3 text-left shadow-sm"><div className="grid h-20 place-items-center rounded-xl bg-[#eef5eb] text-3xl">🌱</div><b className="mt-2 block text-xs">{plant.name}</b><p className="text-[10px] text-gray-500">{plant.species || "Species not set"}</p></button>)}</div> : <Card className="p-4"><p className="text-xs text-gray-600">Your garden is empty. Add your first plant to see it here.</p><button onClick={() => go("plants")} className="mt-2 text-xs font-bold text-[#087a43]">Add a plant →</button></Card>}
        </div>
        <Card className="p-4"><div className="flex items-center justify-between"><b className="text-sm">Today's garden tip</b><Sparkles size={18} className="text-[#13864a]" /></div><p className="mt-2 text-xs leading-5 text-[#68766b]">Check the soil before watering. The top layer drying out is a useful first clue, but each plant has different needs.</p><button onClick={() => go("assistant")} className="mt-3 text-xs font-bold text-[#087a43]">Ask PlantPal →</button></Card>
      </main>
    </>
  );
}