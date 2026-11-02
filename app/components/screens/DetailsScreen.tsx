"use client";

import {useState} from "react";
import {useUser} from "@clerk/nextjs";
import {useMutation,useQuery} from "convex/react";
import {api} from "../../../convex/_generated/api";
import {Activity,CalendarDays,CloudSun,MapPin,Loader2,Sprout,Droplets,Sun,FlaskConical,AlertTriangle} from "lucide-react";
import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {Photo} from "../ui/Photo";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

type CareProfile = {
  commonName:string; scientificName:string; summary:string;
  growingConditions:{label:string;detail:string}[];
  irrigation:{method:string;frequency:string;amount:string;seasonalAdjustment:string};
  fertilizer:{type:string;npk:string;frequency:string;application:string;organicAlternative:string};
  recommendations:string[]; cautions:string[]; dataContext:string;
};

export function DetailsScreen({screen,go,back,plantName,added,setAdded}:{screen:Screen;go:(s:Screen)=>void;back:()=>void;plantName:string;added:boolean;setAdded:(v:boolean)=>void}) {
  const {isLoaded,isSignedIn}=useUser();
  const plants=useQuery(api.plants.list,isLoaded&&isSignedIn?{}:"skip");
  const addPlant=useMutation(api.plants.add);
  const removePlant=useMutation(api.plants.remove);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [city,setCity]=useState("");
  const [coords,setCoords]=useState<{lat:number;lon:number}|null>(null);
  const [locating,setLocating]=useState(false);
  const [loading,setLoading]=useState(false);
  const [profile,setProfile]=useState<CareProfile|null>(null);
  const [weatherPlace,setWeatherPlace]=useState("");
  const [sourceNote,setSourceNote]=useState("");
  const existing=plants?.find((p:any)=>p.name.toLowerCase()===plantName.toLowerCase());
  const identifyNotes=existing?.notes||"";
  const useLocation=()=>{
    setError("");
    if(!navigator.geolocation){setError("Location is unavailable in this browser. Enter your city instead.");return;}
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      p=>{setCoords({lat:p.coords.latitude,lon:p.coords.longitude});setCity("");setLocating(false);},
      ()=>{setLocating(false);setError("Location permission was not available. Enter your city or town manually.");},
      {enableHighAccuracy:false,timeout:12000,maximumAge:300000}
    );
  };
  const generate=async()=>{
    if(!coords&&!city.trim()){setError("Choose your current location or enter a city to get locally relevant advice.");return;}
    setLoading(true);setError("");setProfile(null);
    try{
      const response=await fetch("/api/plant-care",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plantName,scientificName:existing?.species||"",notes:identifyNotes,...(coords?coords:{city:city.trim()})})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Could not generate plant care details.");
      setProfile(data.result);setWeatherPlace(data.climate?.location||city||"Your selected location");
      setSourceNote(data.contextNote||"Advice is based on current weather and general horticultural requirements.");
    }catch(e){setError(e instanceof Error?e.message:"Could not generate plant care details.");}
    finally{setLoading(false);}
  };
  const toggle=async()=>{
    if(!isSignedIn){setError("Sign in to manage your saved plants.");return;}
    setBusy(true);setError("");
    try{if(existing)await removePlant({id:existing._id});else await addPlant({name:plantName});setAdded(!existing);}
    catch(e){setError(e instanceof Error?e.message:"Could not update My Plants.");}
    finally{setBusy(false);}
  };
  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES}/>
      <main className="flex-1 space-y-4 px-4 pb-6 pt-4">
        {existing?.imageUrl?<img src={existing.imageUrl} alt={plantName} className="h-56 w-full rounded-2xl object-cover"/>:<Photo label="Plant detail image" height="h-56" emoji="🌱"/>}
        <div><h2 className="text-xl font-bold">{plantName}</h2><p className="mt-1 text-xs italic text-gray-500">{existing?.species||"Scientific name not recorded"}</p></div>
        {identifyNotes&&<Card className="p-4"><b className="text-sm">Saved identification notes</b><p className="mt-2 whitespace-pre-line text-xs leading-5 text-gray-600">{identifyNotes}</p></Card>}
        <Card className="space-y-3 p-4">
          <div><b className="text-sm">Generate local growing guide</b><p className="mt-1 text-xs leading-5 text-gray-500">PlantPal combines the plant's growing requirements with your local weather and season to tailor irrigation and fertilizer guidance.</p></div>
          <button onClick={useLocation} disabled={locating} className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-3 text-xs font-semibold text-green-800">{locating?<Loader2 size={15} className="animate-spin"/>:<MapPin size={15}/>} {locating?"Getting location…":"Use my current location"}</button>
          {coords&&<p className="text-[10px] text-green-700">GPS location selected for weather lookup.</p>}
          <p className="text-center text-[10px] text-gray-400">OR ENTER LOCATION MANUALLY</p>
          <input value={city} onChange={e=>{setCity(e.target.value);if(e.target.value)setCoords(null);}} placeholder="City or town (e.g. Chennai, Tamil Nadu)" className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none"/>
          <button onClick={generate} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087a43] py-3 text-sm font-bold text-white disabled:opacity-60">{loading?<Loader2 size={16} className="animate-spin"/>:<Sprout size={16}/>} {loading?"Preparing local plant guide…":"Generate plant care details"}</button>
          <p className="text-[10px] leading-4 text-gray-400">Weather lookup needs your permission or a city name. GPS coordinates are used for this request only.</p>
        </Card>
        {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        {profile&&<div className="space-y-3">
          <Card className="p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-green-700">Local care profile · {weatherPlace}</p><b className="mt-1 block text-base">{profile.commonName}</b><p className="mt-2 text-xs leading-5 text-gray-600">{profile.summary}</p><p className="mt-2 text-[10px] text-gray-400">{profile.dataContext}</p></Card>
          <Card className="space-y-3 p-4"><div className="flex items-center gap-2"><Droplets size={18} className="text-sky-600"/><b className="text-sm">Irrigation plan</b></div><p className="text-xs"><b>Recommended method:</b> {profile.irrigation.method}</p><p className="text-xs"><b>Frequency:</b> {profile.irrigation.frequency}</p><p className="text-xs"><b>Amount / technique:</b> {profile.irrigation.amount}</p><p className="text-xs leading-5 text-gray-600"><b>Weather adjustment:</b> {profile.irrigation.seasonalAdjustment}</p></Card>
          <Card className="space-y-3 p-4"><div className="flex items-center gap-2"><FlaskConical size={18} className="text-amber-600"/><b className="text-sm">Fertilizer recommendation</b></div><p className="text-xs"><b>Type:</b> {profile.fertilizer.type}</p><p className="text-xs"><b>NPK guidance:</b> {profile.fertilizer.npk}</p><p className="text-xs"><b>Frequency:</b> {profile.fertilizer.frequency}</p><p className="text-xs leading-5 text-gray-600"><b>Application:</b> {profile.fertilizer.application}</p><p className="text-xs leading-5 text-gray-600"><b>Organic option:</b> {profile.fertilizer.organicAlternative}</p></Card>
          <Card className="space-y-3 p-4"><div className="flex items-center gap-2"><Sun size={18} className="text-amber-500"/><b className="text-sm">Growing conditions</b></div>{profile.growingConditions.map((item,i)=><div key={i} className="border-b border-gray-100 pb-2 last:border-0"><b className="text-xs">{item.label}</b><p className="mt-1 text-xs leading-5 text-gray-600">{item.detail}</p></div>)}</Card>
          <Card className="p-4"><b className="text-sm">Practical next steps</b>{profile.recommendations.map((item,i)=><p key={i} className="mt-2 text-xs leading-5 text-gray-600">• {item}</p>)}</Card>
          {profile.cautions?.length>0&&<Card className="bg-amber-50 p-4"><div className="flex items-center gap-2"><AlertTriangle size={15} className="text-amber-700"/><b className="text-xs text-amber-900">Important cautions</b></div>{profile.cautions.map((item,i)=><p key={i} className="mt-2 text-xs leading-5 text-amber-900">{item}</p>)}</Card>}
          <p className="px-1 text-[10px] leading-4 text-gray-400">{sourceNote} Exact fertilizer dosage should follow the product label and crop stage; confirm soil nutrient needs with a soil test when possible.</p>
        </div>}
        <button disabled={busy} onClick={toggle} className="w-full rounded-xl border border-[#087a43] py-3 text-sm font-bold text-[#087a43] disabled:opacity-60">{busy?"Saving…":existing?"Remove from My Plants":"Add to My Plants"}</button>
        <div className="space-y-1"><button onClick={()=>go("health")} className="w-full rounded-xl bg-white py-3 text-xs font-semibold text-gray-700">Plant Health</button><button onClick={()=>go("weather")} className="w-full rounded-xl bg-white py-3 text-xs font-semibold text-gray-700">Local Weather</button></div>
      </main>
    </>
  );
}
