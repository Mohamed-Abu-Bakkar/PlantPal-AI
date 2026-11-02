"use client";

export function Pill({children, active = false, onClick}:{children: React.ReactNode; active?: boolean; onClick?: () => void}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${active ? "bg-[#087a43] text-white" : "bg-[#f2f5f0] text-[#68766b]"}`}
    >
      {children}
    </button>
  );
}
