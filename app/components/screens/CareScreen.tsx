"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {Droplets, Sprout, Sun, Activity, ThermometerSun, CalendarDays, ChevronRight} from "lucide-react";
import {Header} from "../ui/Header";
import {Pill} from "../ui/Pill";
import {Card} from "../ui/Card";
import {Row} from "../ui/Row";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function CareScreen({screen, go, back, careTab, setCareTab}:{screen: Screen; go: (s: Screen) => void; back: () => void; careTab: string; setCareTab: (v: string) => void}) {
  const {isLoaded,isSignedIn}=useUser();
  const plants=useQuery(api.plants.list,isLoaded&&isSignedIn?{}:"skip");
  const tasks=useQuery(api.plants.tasks,isLoaded&&isSignedIn?{}:"skip");
  const selected=plants?.find(p=>p.name===undefined) ?? plants?.[0];
  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
      <main className="flex-1 px-3 pb-6 pt-3">
        <div className="mb-3 flex gap-2 overflow-x-auto">{["Overview", "Care Schedule", "Growth"].map((t) => <Pill key={t} active={careTab === t} onClick={() => setCareTab(t)}>{t}</Pill>)}</div>
        {careTab === "Overview" ? (
          <Card className="overflow-hidden">
            {[[Droplets, "Watering", "Check soil moisture before watering"], [Sprout, "Fertilizer", "Follow the needs of your selected species"], [Sun, "Sunlight", "Check species-specific light requirements"], [Activity, "Soil", "Check drainage and soil condition"], [ThermometerSun, "Temperature", "Use local weather as a guide"]].map((item: any) => { const [I,t,d]=item; return <Row key={t} icon={I} title={t} desc={d} onClick={() => go("assistant")} />; })}
            <p className="border-t border-gray-100 p-3 text-[11px] text-gray-500">{selected ? "Selected garden plant: "+selected.name : "Add a plant to personalize care guidance."}</p>
          </Card>
        ) : careTab === "Care Schedule" ? (
          <Card className="p-4"><b className="text-sm">Your saved care schedule</b>{!isSignedIn ? <p className="mt-3 text-xs text-gray-500">Sign in to view saved tasks.</p> : tasks?.length ? tasks.map(task=><div className="mt-4 flex gap-3 text-xs" key={task._id}><CalendarDays className="text-green-600" size={18}/><span className={task.completed?"line-through text-gray-400":""}>{new Date(task.dueAt).toLocaleDateString()} · {task.title}</span></div>) : <p className="mt-3 text-xs text-gray-500">No care tasks saved yet. Create reminders from Alerts.</p>}</Card>
        ) : (
          <Card className="p-4"><b className="text-sm">Growth journey</b><p className="mt-3 text-xs text-gray-600">Growth observations are not yet recorded for this plant. Add dated notes as your plant develops.</p></Card>
        )}
        <Card className="mt-3 flex items-center gap-3 bg-[#e8f5e9] p-4"><span className="text-2xl">🌼</span><div className="flex-1"><b className="text-xs">Care guidance</b><p className="text-[11px] text-gray-600">Plant needs vary by species and local growing conditions.</p></div><ChevronRight className="text-green-700" /></Card>
      </main>
    </>
  );
}