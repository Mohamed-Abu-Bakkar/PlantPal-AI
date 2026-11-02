"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Plus, ChevronRight, Trash2, Leaf, Loader2 } from "lucide-react";
import { Header } from "../ui/Header";
import { Card } from "../ui/Card";
import { Photo } from "../ui/Photo";
import { BottomNav } from "../ui/BottomNav";
import { SCREEN_TITLES } from "../shared/types";
import type { Screen } from "../shared/types";

export function PlantsScreen({ screen, go, back, plantName, setPlantName }: { screen: Screen; go: (s: Screen) => void; back: () => void; plantName: string; setPlantName: (v: string) => void }) {
  const { isLoaded, isSignedIn } = useUser();
  const plants = useQuery(api.plants.list, isLoaded && isSignedIn ? {} : "skip");
  const addPlant = useMutation(api.plants.add);
  const removePlant = useMutation(api.plants.remove);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function savePlant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await addPlant({ name: name.trim(), species: species.trim() || undefined });
      setName("");
      setSpecies("");
      setShowAdd(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this plant.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePlant(id: Id<"plants">) {
    try {
      await removePlant({ id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this plant.");
    }
  }

  return (
    <>
      <Header backable={false} screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
      <main className="flex-1 space-y-3 px-4 pb-5 pt-4">
        <div className="flex items-center justify-between">
          <div><b className="text-lg">My Plants</b><p className="text-xs text-gray-500">Your personal garden, saved to your account</p></div>
          <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 rounded-xl bg-[#087a43] px-3 py-2 text-xs font-bold text-white"><Plus size={15} /> Add</button>
        </div>
        {showAdd && <Card className="p-4"><form onSubmit={savePlant} className="space-y-3"><label className="block text-xs font-semibold">Plant name<input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Tomato" className="mt-1 w-full rounded-xl border border-[#dce6dc] px-3 py-2 text-sm outline-none focus:border-[#087a43]" /></label><label className="block text-xs font-semibold">Species (optional)<input value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="e.g. Cherry tomato" className="mt-1 w-full rounded-xl border border-[#dce6dc] px-3 py-2 text-sm outline-none focus:border-[#087a43]" /></label><div className="flex gap-2"><button disabled={saving} className="rounded-xl bg-[#087a43] px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{saving ? "Saving…" : "Save plant"}</button><button type="button" onClick={() => setShowAdd(false)} className="rounded-xl bg-[#edf4ec] px-4 py-2 text-xs font-semibold">Cancel</button></div></form></Card>}
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        {!isLoaded || (isSignedIn && plants === undefined) ? <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500"><Loader2 className="animate-spin" size={18}/> Loading your garden…</div> : !isSignedIn ? <Card className="p-6 text-center"><Leaf className="mx-auto mb-2 text-[#087a43]" size={28}/><b className="text-sm">Sign in to save your garden</b><p className="mt-1 text-xs text-gray-500">Your plants and care records are private to your account.</p><button onClick={() => go("home")} className="mt-3 text-xs font-bold text-[#087a43]">Go to home</button></Card> : plants?.length ? plants.map((plant) => <Card key={plant._id} className="flex items-center gap-3 p-3"><button onClick={() => { setPlantName(plant.name); go("care"); }} className="flex min-w-0 flex-1 items-center gap-3 text-left"><Photo label={plant.name} height="h-20 w-24" emoji="🌱" /><div className="min-w-0 flex-1"><b className="block truncate text-sm">{plant.name}</b><p className="truncate text-xs text-gray-500">{plant.species || "Plant"}</p><p className="mt-1 text-[10px] font-semibold text-green-700">● Saved to your garden</p></div><ChevronRight size={18} className="text-gray-400"/></button><button aria-label={`Delete ${plant.name}`} onClick={() => deletePlant(plant._id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button></Card>) : <Card className="p-6 text-center"><Leaf className="mx-auto mb-2 text-[#087a43]" size={28}/><b className="text-sm">Your garden is ready to grow</b><p className="mt-1 text-xs text-gray-500">Add your first plant. It will be saved to your account and available when you return.</p><button onClick={() => setShowAdd(true)} className="mt-3 rounded-xl bg-[#087a43] px-4 py-2 text-xs font-bold text-white">Add your first plant</button></Card>}
      </main>
      <BottomNav screen={screen} go={go} />
    </>
  );
}
