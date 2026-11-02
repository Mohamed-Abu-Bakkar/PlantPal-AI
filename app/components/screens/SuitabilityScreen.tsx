"use client";

import {useState} from "react";
import {useUser} from "@clerk/nextjs";
import {useMutation,useQuery} from "convex/react";
import {api} from "../../../convex/_generated/api";
import {Search,X} from "lucide-react";
import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {CheckCircle2} from "lucide-react";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function SuitabilityScreen({screen,go,back,search,setSearch,plantName,setPlantName,added,setAdded}:{screen:Screen;go:(s:Screen)=>void;back:()=>void;search:string;setSearch:(v:string)=>void;plantName:string;setPlantName:(v:string)=>void;added:boolean;setAdded:(v:boolean)=>void}) {
  const {isLoaded,isSignedIn}=useUser();
  const history=useQuery(api.userData.suitabilityHistory,isLoaded&&isSignedIn?{}:"skip");
  const saveSuitability=useMutation(api.userData.saveSuitability);
  const addPlant=useMutation(api.plants.add);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const save=async()=>{
    const name=search.trim()||"Mango";setSaving(true);setError("");
    try{
      if(!isSignedIn)throw new Error("Sign in to save this plant and its suitability request.");
      await saveSuitability({plantName:name,result:"Not evaluated",notes:"Plant selection saved. A verified location and climate suitability calculation is not yet available."});
      await addPlant({name});setPlantName(name);setAdded(true);go("care");
    }catch(e){setError(e instanceof Error?e.message:"Could not save this plant.");}
    finally{setSaving(false);}
  };
  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES}/>
      <main className="flex-1 space-y-4 px-4 pb-6 pt-4">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3"><Search size={18} className="text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} className="w-full py-3 text-sm outline-none" placeholder="Search a plant"/><button onClick={()=>setSearch("")}><X size={16}/></button></div>
        <Card className="p-4"><b className="text-sm">Plant suitability</b><p className="mt-2 text-xs leading-5 text-gray-600">A reliable suitability score needs your location, local climate and plant-specific growing requirements. PlantPal has not calculated a score for this search yet.</p></Card>
        <Card className="p-4"><b className="text-sm">Factors to evaluate</b>{["Temperature range","Rainfall and seasonal pattern","Soil type and drainage","Planting season and sunlight"].map(t=><p className="mt-3 flex gap-2 text-xs" key={t}><CheckCircle2 size={16} className="text-green-600"/>{t}</p>)}</Card>
        <button disabled={saving||!isLoaded} onClick={save} className="w-full rounded-xl bg-[#087a43] py-3 text-sm font-bold text-white">{saving?"Saving…":"Save plant to My Plants"}</button>
        {error&&<p className="text-xs text-red-600">{error}</p>}
        {isSignedIn&&<Card className="p-4"><b className="text-sm">Saved plant selections</b>{history?.length?<div className="mt-2 space-y-2">{history.slice(0,5).map(item=><div key={item._id} className="border-b border-gray-100 py-2"><b className="text-xs">{item.plantName}</b><p className="text-[10px] text-gray-500">{item.result} · {new Date(item.createdAt).toLocaleDateString()}</p></div>)}</div>:<p className="mt-2 text-xs text-gray-500">No saved selections yet.</p>}</Card>}
      </main>
    </>
  );
}