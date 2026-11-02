"use client";

import {useState} from "react";
import {useUser} from "@clerk/nextjs";
import {useMutation,useQuery} from "convex/react";
import {api} from "../../../convex/_generated/api";
import {Search, MapPin, Loader2, Sprout, CheckCircle2, AlertTriangle} from "lucide-react";
import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

type Assessment = {
  score:number; verdict:string; summary:string; bestPlantingWindow:string;
  factors:{label:string;status:string;detail:string}[];
  recommendations:string[]; caveats:string[];
};

export function SuitabilityScreen({screen,go,back,search,setSearch,plantName,setPlantName,added,setAdded}:{screen:Screen;go:(s:Screen)=>void;back:()=>void;search:string;setSearch:(v:string)=>void;plantName:string;setPlantName:(v:string)=>void;added:boolean;setAdded:(v:boolean)=>void}) {
  const {isLoaded,isSignedIn}=useUser();
  const history=useQuery(api.userData.suitabilityHistory,isLoaded&&isSignedIn?{}:"skip");
  const saveSuitability=useMutation(api.userData.saveSuitability);
  const addPlant=useMutation(api.plants.add);
  const [city,setCity]=useState("");
  const [coords,setCoords]=useState<{lat:number;lon:number}|null>(null);
  const [locationLabel,setLocationLabel]=useState("");
  const [locating,setLocating]=useState(false);
  const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [assessment,setAssessment]=useState<Assessment|null>(null);
  const [weatherLocation,setWeatherLocation]=useState("");
  const [saved,setSaved]=useState(false);

  const useLocation=()=>{
    setError("");
    if(!navigator.geolocation){setError("Location is not available in this browser. Enter your city instead.");return;}
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      p=>{setCoords({lat:p.coords.latitude,lon:p.coords.longitude});setLocationLabel("GPS location");setCity("");setLocating(false);},
      ()=>{setLocating(false);setError("Location permission was unavailable. Enter your city or town manually.");},
      {enableHighAccuracy:false,timeout:12000,maximumAge:300000}
    );
  };

  const analyze=async()=>{
    const name=search.trim();
    if(!name){setError("Enter the plant name you want to grow.");return;}
    if(!coords&&!city.trim()){setError("Use your location or enter a city/town.");return;}
    setLoading(true);setError("");setAssessment(null);setSaved(false);
    try{
      const response=await fetch("/api/suitability",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plantName:name,...(coords?coords:{city:city.trim()})})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Suitability check failed.");
      setAssessment(data.result);setWeatherLocation(data.climate?.location||city||"Selected location");
    }catch(e){setError(e instanceof Error?e.message:"Suitability check failed.");}
    finally{setLoading(false);}
  };

  const save=async()=>{
    if(!assessment)return;
    if(!isSignedIn){setError("Sign in to save this suitability result.");return;}
    setSaving(true);setError("");
    try{
      await saveSuitability({plantName:search.trim(),location:weatherLocation,result:assessment.verdict,score:assessment.score,notes:JSON.stringify({summary:assessment.summary,bestPlantingWindow:assessment.bestPlantingWindow,factors:assessment.factors,recommendations:assessment.recommendations,caveats:assessment.caveats})});
      setSaved(true);
    }catch(e){setError(e instanceof Error?e.message:"Could not save this result.");}
    finally{setSaving(false);}
  };

  const addToGarden=async()=>{
    if(!assessment)return;
    if(!isSignedIn){setError("Sign in to add a plant to My Plants.");return;}
    setSaving(true);setError("");
    try{await addPlant({name:search.trim(),location:weatherLocation,notes:"Suitability: "+assessment.verdict+" ("+assessment.score+"/100). "+assessment.summary});setPlantName(search.trim());setAdded(true);go("plants");}
    catch(e){setError(e instanceof Error?e.message:"Could not add this plant.");}
    finally{setSaving(false);}
  };

  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES}/>
      <main className="flex-1 space-y-4 px-4 pb-6 pt-4">
        <Card className="space-y-3 p-4">
          <div><b className="text-sm">Can I grow this plant here?</b><p className="mt-1 text-xs leading-5 text-gray-500">PlantPal checks the plant, local season and live weather to estimate how suitable it is to plant now.</p></div>
          <label className="block text-xs font-semibold">Plant name</label>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3"><Sprout size={17} className="text-green-700"/><input value={search} onChange={e=>{setSearch(e.target.value);setAssessment(null);setSaved(false);}} onKeyDown={e=>{if(e.key==="Enter")analyze();}} className="w-full py-3 text-sm outline-none" placeholder="e.g. Tomato, Mango, Spinach"/></div>
          <label className="block text-xs font-semibold">Growing location</label>
          <button onClick={useLocation} disabled={locating} className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-3 text-xs font-semibold text-green-800">{locating?<Loader2 size={15} className="animate-spin"/>:<MapPin size={15}/>} {locating?"Getting location…":"Use my current location"}</button>
          {locationLabel&&coords&&<p className="text-[10px] text-green-700">GPS location selected. Coordinates are used for weather lookup.</p>}
          <div className="text-center text-[10px] text-gray-400">OR ENTER LOCATION MANUALLY</div>
          <input value={city} onChange={e=>{setCity(e.target.value);if(e.target.value){setCoords(null);setLocationLabel("");}setAssessment(null);setSaved(false);}} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none" placeholder="City or town (e.g. Chennai, Tamil Nadu)"/>
          <button onClick={analyze} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087a43] py-3 text-sm font-bold text-white disabled:opacity-60">{loading?<Loader2 size={16} className="animate-spin"/>:<Search size={16}/>} {loading?"Checking local conditions…":"Check growing suitability"}</button>
          <p className="text-[10px] leading-4 text-gray-400">Location is used only for this check. GPS is optional; manual location works too.</p>
        </Card>

        {error&&<p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}

        {assessment&&<div className="space-y-3">
          <Card className="p-4">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Growing suitability · {weatherLocation}</p><b className="mt-1 block text-lg">{assessment.verdict}</b></div><div className="text-right"><b className="text-3xl text-green-700">{assessment.score}</b><p className="text-[10px] text-gray-400">out of 100</p></div></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#087a43]" style={{width:assessment.score+"%"}}/></div>
            <p className="mt-3 text-xs leading-5 text-gray-600">{assessment.summary}</p>
            {assessment.bestPlantingWindow&&<p className="mt-3 rounded-lg bg-green-50 p-3 text-xs"><b>Planting window:</b> {assessment.bestPlantingWindow}</p>}
          </Card>
          <Card className="space-y-3 p-4"><b className="text-sm">What affects the result?</b>{assessment.factors.map((factor,i)=><div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"><div className="flex items-center gap-2 text-xs font-semibold">{factor.status==="good"?<CheckCircle2 size={15} className="text-green-600"/>:factor.status==="poor"?<AlertTriangle size={15} className="text-red-500"/>:<AlertTriangle size={15} className="text-amber-500"/>}{factor.label}<span className="ml-auto text-[10px] font-medium capitalize text-gray-400">{factor.status}</span></div><p className="mt-1 text-xs leading-5 text-gray-600">{factor.detail}</p></div>)}</Card>
          <Card className="p-4"><b className="text-sm">Recommended next steps</b>{assessment.recommendations.map((item,i)=><p key={i} className="mt-2 flex gap-2 text-xs leading-5 text-gray-600"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-600"/>{item}</p>)}</Card>
          {assessment.caveats?.length>0&&<Card className="bg-amber-50 p-4"><b className="text-xs text-amber-900">Important limitations</b>{assessment.caveats.map((item,i)=><p key={i} className="mt-2 text-xs leading-5 text-amber-900">{item}</p>)}</Card>}
          <div className="grid grid-cols-2 gap-2"><button onClick={save} disabled={saving||saved||!isSignedIn} className="rounded-xl border border-green-700 py-3 text-xs font-bold text-green-800 disabled:opacity-50">{saved?"Result saved":saving?"Saving…":"Save result"}</button><button onClick={addToGarden} disabled={saving||!isSignedIn} className="rounded-xl bg-[#087a43] py-3 text-xs font-bold text-white disabled:opacity-50">Add to My Plants</button></div>
          {!isSignedIn&&<p className="text-center text-[10px] text-gray-500">Sign in to save results or add plants to your garden.</p>}
        </div>}

        {isSignedIn&&<Card className="p-4"><b className="text-sm">Recent suitability checks</b>{history?.length?<div className="mt-2 space-y-2">{history.slice(0,5).map(item=><div key={item._id} className="border-b border-gray-100 py-2 last:border-0"><div className="flex justify-between gap-2"><b className="text-xs">{item.plantName}</b><span className="text-[10px] text-green-700">{item.score!==undefined?item.score+"/100":""}</span></div><p className="text-[10px] text-gray-500">{item.result} · {item.location||"Location not saved"} · {new Date(item.createdAt).toLocaleDateString()}</p></div>)}</div>:<p className="mt-2 text-xs text-gray-500">No saved checks yet.</p>}</Card>}
      </main>
    </>
  );
}
