"use client";

import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {Photo} from "../ui/Photo";
import {CheckCircle2} from "lucide-react";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function HealthScreen({screen, go, back}:{screen: Screen; go: (s: Screen) => void; back: () => void}) {
  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
      <main className="flex-1 space-y-4 px-4 pb-6 pt-4">
        <Photo label="Plant leaf / issue photo" height="h-48" emoji="🍃" />
        <div>
          <p className="text-xs font-bold text-orange-600">Possible Issue</p>
          <h2 className="mt-1 font-bold">Early Blight (Fungal Disease)</h2>
          <p className="mt-1 text-xs text-gray-500">Illustrative example · Not a confirmed diagnosis</p>
        </div>
        <Card className="p-4"><b className="text-sm">Symptoms to check</b>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-xs text-gray-600">
            <li>Brown spots on older leaves</li>
            <li>Yellowing around affected areas</li>
            <li>Spreading lesions after humid weather</li>
          </ul>
        </Card>
        <Card className="p-4"><b className="text-sm">General care steps</b>{["Remove severely affected leaves", "Improve air circulation", "Avoid overhead watering", "Confirm diagnosis before treatment"].map((t) => <p className="mt-3 flex gap-2 text-xs" key={t}><CheckCircle2 size={16} className="text-green-600" />{t}</p>)}</Card>
      </main>
    </>
  );
}
