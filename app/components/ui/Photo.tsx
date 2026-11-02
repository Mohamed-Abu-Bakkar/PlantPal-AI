"use client";

export function Photo({label = "Plant photo", height = "h-40", emoji = "🌱"}:{label?: string; height?: string; emoji?: string}) {
  return (
    <div className={`relative ${height} w-full overflow-hidden rounded-2xl border border-[#e4eee4] bg-gradient-to-br from-[#e7f3e6] via-[#f4f7eb] to-[#d4e8d2] flex flex-col items-center justify-center text-[#37754b]`}>
      <div className="absolute -left-5 -top-6 h-28 w-28 rounded-full bg-white/50 blur-xl" />
      <div className="text-5xl relative">{emoji}</div>
      <span className="relative mt-2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-medium text-[#477454]">
        PHOTO PLACEHOLDER · {label}
      </span>
    </div>
  );
}
