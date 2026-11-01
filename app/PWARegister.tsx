"use client";
import {useEffect} from "react";

export function PWARegister(){
  useEffect(()=>{
    if("serviceWorker" in navigator){
      window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch((error)=>console.error("PlantPal service worker registration failed",error));},{once:true});
    }
  },[]);
  return null;
}
