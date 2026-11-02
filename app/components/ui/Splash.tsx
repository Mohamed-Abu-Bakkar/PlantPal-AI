"use client";

export function Splash() {
  return (
    <main className="fixed inset-0 z-[100] min-h-[100svh] overflow-hidden bg-[#f2f6ed]">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('/splash-bg.png')"}} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10" />
      <div className="relative z-10 flex h-full min-h-[100svh] flex-col items-center px-5 text-center">
        <div className="mt-[18vh] flex flex-col items-center">
          <img src="/plantpal-logo.png" alt="PlantPal AI logo" className="mb-3 h-[112px] w-[112px] object-contain drop-shadow-[0_2px_8px_rgba(0,80,30,.12)]" />
          <h1 className="text-[34px] font-extrabold tracking-tight text-[#075d35] drop-shadow-[0_1px_2px_rgba(255,255,255,.7)]">
            PlantPal AI
          </h1>
          <p className="mt-1 text-[17px] font-medium leading-6 text-[#087a43]">
            “Everyone, Anywhere<br/>Can Plant.”
          </p>
        </div>
      </div>
    </main>
  );
}
