"use client";

export function Row({icon: Icon, title, desc, right = "›", onClick}:{icon: any; title: string; desc: string; right?: string; onClick?: () => void}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 border-b border-[#edf1eb] px-3 py-3 text-left last:border-0">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f1f7ef] text-[#16834a]">
        <Icon size={21} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#17251c]">{title}</p>
        <p className="mt-0.5 text-[11px] text-[#849087]">{desc}</p>
      </div>
      <span className="text-xl text-[#9aa69d]">{right}</span>
    </button>
  );
}
