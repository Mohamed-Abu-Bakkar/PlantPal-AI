"use client";

import {Bell} from "lucide-react";
import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {BottomNav} from "../ui/BottomNav";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function AlertsScreen({screen, go, back}:{screen: Screen; go: (s: Screen) => void; back: () => void}) {
  return (
    <>
      <Header backable={false} screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
      <main className="flex-1 space-y-3 px-4 pb-5 pt-4">
        <b className="text-lg">Alerts & Reminders</b>
        {["Check soil moisture today", "Fertilizer check in 2 days", "Inspect leaves this weekend"].map((t, i) => <Card key={t} className="flex items-center gap-3 p-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eff6ed] text-green-700"><Bell /></div><div><b className="text-xs">{t}</b><p className="text-[10px] text-gray-500">{i === 0 ? "Today" : i === 1 ? "Upcoming" : "Care reminder"}</p></div></Card>)}
      </main>
      <BottomNav screen={screen} go={go} />
    </>
  );
}
