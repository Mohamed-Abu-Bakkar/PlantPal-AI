"use client";

import {Sparkles, ArrowRight} from "lucide-react";
import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function AssistantScreen({screen, go, back, chat, setChat, messages, setMessages, aiLoading, serviceError, setServiceError, sendChat}:{screen: Screen; go: (s: Screen) => void; back: () => void; chat: string; setChat: (v: string) => void; messages: string[]; setMessages: (v: string[] | ((prev: string[]) => string[])) => void; aiLoading: boolean; serviceError: string; setServiceError: (v: string) => void; sendChat: (e: React.FormEvent) => void}) {
  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
      <main className="flex flex-1 flex-col px-4 pb-5 pt-4">
        <Card className="mb-3 p-4"><div className="flex items-center gap-2"><Sparkles className="text-green-700" /><b className="text-sm">PlantPal AI Assistant</b></div><p className="mt-2 text-xs text-gray-500">Ask questions about plant care, watering, soil and growing conditions.</p></Card>
        <div className="flex-1 space-y-3 overflow-y-auto">{messages.map((m, i) => <div key={i} className={`max-w-[85%] rounded-2xl p-3 text-xs leading-5 ${i === 0 ? "bg-[#eef5eb]" : "ml-auto bg-[#087a43] text-white"}`}>{m}</div>)}</div>
        <form onSubmit={sendChat} className="mt-4 flex gap-2"><input value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Ask PlantPal..." className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs outline-none" /><button disabled={aiLoading} className="rounded-xl bg-[#087a43] px-4 text-white"><ArrowRight /></button></form>
        {aiLoading && <p className="mt-2 text-xs text-green-700">PlantPal is thinking…</p>}
        {serviceError && <p className="mt-2 text-xs text-red-600">{serviceError}</p>}
      </main>
    </>
  );
}
