"use client";
import {useEffect,useState} from "react";

type InstallPromptEvent = Event & {
  prompt:()=>Promise<void>;
  userChoice:Promise<{outcome:"accepted"|"dismissed"}>;
};

export function PWARegister(){
  const [installEvent,setInstallEvent]=useState<InstallPromptEvent|null>(null);
  const [isInstalled,setIsInstalled]=useState(false);
  const [isIOS,setIsIOS]=useState(false);

  useEffect(()=>{
    const standalone=window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & {standalone?:boolean}).standalone===true;
    setIsInstalled(standalone);
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

    if("serviceWorker" in navigator){
      const register=()=>navigator.serviceWorker.register("/sw.js").catch((error)=>console.error("PlantPal service worker registration failed",error));
      if(document.readyState==="complete") register();
      else window.addEventListener("load",register,{once:true});
    }

    const onInstall=(event:Event)=>{
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const onInstalled=()=>{
      setIsInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt",onInstall);
    window.addEventListener("appinstalled",onInstalled);
    return ()=>{
      window.removeEventListener("beforeinstallprompt",onInstall);
      window.removeEventListener("appinstalled",onInstalled);
    };
  },[]);

  const install=async()=>{
    if(isInstalled)return;
    if(installEvent){
      await installEvent.prompt();
      const choice=await installEvent.userChoice;
      if(choice.outcome==="accepted")setIsInstalled(true);
      setInstallEvent(null);
      return;
    }
    if(isIOS){
      alert("Install PlantPal AI:\n1. Open this page in Safari.\n2. Tap the Share button.\n3. Choose 'Add to Home Screen'.\n4. Tap Add.");
      return;
    }
    alert("To install PlantPal AI, open your browser menu (⋮) and choose 'Install app' or 'Add to Home screen'. If the option is missing, open the site in Chrome and try again after browsing the app.");
  };

  if(isInstalled)return null;
  return <button
    type="button"
    onClick={install}
    aria-label="Install PlantPal AI app"
    className="fixed bottom-20 right-4 z-[90] flex items-center gap-2 rounded-full border border-white/70 bg-[#087a43] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,80,40,.28)] transition hover:bg-[#066b39] active:scale-95"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M5 17v3h14v-3"/></svg>
    Install App
  </button>;
}
