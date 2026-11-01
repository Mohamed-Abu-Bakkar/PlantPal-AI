"use client";
import {useEffect,useState} from "react";

type InstallPromptEvent = Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed"}>};

export function PWARegister(){
  const [installEvent,setInstallEvent]=useState<InstallPromptEvent|null>(null);
  const [showIOSHelp,setShowIOSHelp]=useState(false);
  useEffect(()=>{
    if("serviceWorker" in navigator){
      window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch((error)=>console.error("PlantPal service worker registration failed",error));},{once:true});
    }
    const onInstall=(event:Event)=>{
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt",onInstall);
    const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone=window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & {standalone?:boolean}).standalone===true;
    if(isIOS&&!isStandalone)setShowIOSHelp(true);
    return ()=>window.removeEventListener("beforeinstallprompt",onInstall);
  },[]);
  const install=async()=>{
    if(!installEvent)return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };
  if(installEvent)return <button onClick={install} className="fixed bottom-20 right-4 z-50 rounded-full bg-[#087a43] px-4 py-3 text-xs font-bold text-white shadow-lg">Install PlantPal</button>;
  if(showIOSHelp)return <button onClick={()=>{setShowIOSHelp(false);alert("To install PlantPal: tap the Share button in Safari, then choose 'Add to Home Screen'.");}} className="fixed bottom-20 right-4 z-50 rounded-full bg-[#087a43] px-4 py-3 text-xs font-bold text-white shadow-lg">Add PlantPal to Home Screen</button>;
  return null;
}
