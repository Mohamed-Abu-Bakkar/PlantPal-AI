"use client";

export function Card({children, className = ""}:{children: React.ReactNode; className?: string}) {
  return (
    <div className={`rounded-2xl border border-[#e8eee6] bg-white shadow-[0_3px_14px_rgba(30,70,35,.045)] ${className}`}>
      {children}
    </div>
  );
}
