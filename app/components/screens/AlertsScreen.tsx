"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Bell, Plus, CheckCircle2 } from "lucide-react";
import { Header } from "../ui/Header";
import { Card } from "../ui/Card";
import { BottomNav } from "../ui/BottomNav";
import { SCREEN_TITLES } from "../shared/types";
import type { Screen } from "../shared/types";

export function AlertsScreen({screen, go, back}:{screen: Screen; go: (s: Screen) => void; back: () => void}) {
  const { isLoaded, isSignedIn } = useUser();
  const tasks = useQuery(api.plants.tasks, isLoaded && isSignedIn ? {} : "skip");
  const addTask = useMutation(api.plants.addTask);
  const completeTask = useMutation(api.plants.completeTask);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const addReminder = async () => {
    setSaving(true); setError("");
    try { await addTask({ title: "Check plant health", category: "care", dueAt: Date.now() + 24 * 60 * 60 * 1000 }); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save reminder."); }
    finally { setSaving(false); }
  };
  return (
    <>
      <Header backable={false} screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
      <main className="flex-1 space-y-3 px-4 pb-5 pt-4">
        <div className="flex items-center justify-between"><b className="text-lg">Alerts & Reminders</b><button disabled={!isSignedIn || saving} onClick={addReminder} className="flex items-center gap-1 rounded-lg bg-[#087a43] px-3 py-2 text-xs font-bold text-white"><Plus size={14}/>{saving ? "Saving…" : "Add reminder"}</button></div>
        {!isLoaded || (isSignedIn && tasks === undefined) ? <p className="text-xs text-gray-500">Loading reminders…</p> : !isSignedIn ? <Card className="p-4 text-xs text-gray-600">Sign in to save and manage your reminders.</Card> : tasks?.length ? tasks.map((task) => <Card key={task._id} className="flex items-center gap-3 p-4"><button aria-label={task.completed ? "Mark incomplete" : "Complete reminder"} onClick={() => completeTask({id:task._id,completed:!task.completed})}><CheckCircle2 className={task.completed ? "text-green-700" : "text-gray-300"}/></button><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eff6ed] text-green-700"><Bell /></div><div className="min-w-0 flex-1"><b className={task.completed ? "text-xs text-gray-400 line-through" : "text-xs"}>{task.title}</b><p className="text-[10px] text-gray-500">{new Date(task.dueAt).toLocaleString()}</p></div></Card>) : <Card className="p-4 text-xs text-gray-600">No reminders yet. Add one to start tracking plant care.</Card>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </main>
      <BottomNav screen={screen} go={go} />
    </>
  );
}