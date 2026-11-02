"use client";

import {useState} from "react";
import {useUser} from "@clerk/nextjs";
import {useMutation,useQuery} from "convex/react";
import {api} from "../../../convex/_generated/api";
import {Activity,CalendarDays,CloudSun} from "lucide-react";
import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {Row} from "../ui/Row";
import {Photo} from "../ui/Photo";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function DetailsScreen({screen,go,back,plantName,added,setAdded}:{screen:Screen;go:(s:Screen)=>void;back:()=>void;plantName:string;added:boolean;setAdded:(v:boolean)=>void}) {
  const {isLoaded,isSignedIn}=useUser();
  const plants=useQuery(api.plants.list,isLoaded&&isSignedIn?{}:"skip");
  const addPlant=useMutation(api.plants.add);
  const removePlant=useMutation(api.plants.remove);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const existing=plants?.find(p=>p.name.toLowerCase()===plantName.toLowerCase());
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
        <Photo label="Plant detail image" height="h-56" emoji="🌱"/>
        <h2 className="text-xl font-bold">{plantName}</h2>
        <Card className="p-4"><b className="text-sm">Plant profile</b><p className="mt-2 text-xs leading-5 text-gray-600">Plant-specific growing requirements depend on species, variety and local conditions. Use the care assistant for tailored guidance.</p></Card>
        <Row icon={Activity} title="Plant Health" desc="Inspect leaves and record a health assessment" onClick={()=>go("health")}/>
        <Row icon={CalendarDays} title="Care Guide" desc="Watering, fertilizer and sunlight" onClick={()=>go("care")}/>
        <Row icon={CloudSun} title="Local Weather" desc="Weather context for your garden" onClick={()=>go("weather")}/>
        <button disabled={busy} onClick={toggle} className="w-full rounded-xl bg-[#087a43] py-3 text-sm font-bold text-white">{busy?"Saving…":existing||added?"Remove from My Plants":"Add to My Plants"}</button>
        {error&&<p className="text-xs text-red-600">{error}</p>}
      </main>
    </>
  );
}