"use client";

import type { Screen } from "../shared/types";

export function Tile({Icon, label, onClick, color = "text-[#087a43]"}:{Icon: any; label: string; onClick: () => void; color?: string}) {
  return (
    <button onClick={onClick} className="flex min-h-[78px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#e7eee5] bg-white p-2 shadow-[0_3px_12px_rgba(35,76,38,.05)]">
      <Icon size={23} className={color} />
      <span className="text-[11px] font-semibold text-[#27362c]">{label}</span>
    </button>
  );
}
