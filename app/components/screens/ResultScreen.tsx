"use client";

import {useEffect, useState} from "react";
import {useUser} from "@clerk/nextjs";
import {useMutation} from "convex/react";
import {api} from "../../../convex/_generated/api";
import type {Id} from "../../../convex/_generated/dataModel";
import {Save, PencilLine} from "lucide-react";
import {Header} from "../ui/Header";
import {Card} from "../ui/Card";
import {Photo} from "../ui/Photo";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function ResultScreen({screen,photoData,photoStorageId,plantName,setPlantName,identifyResult,added,setAdded,go,back}:{screen:Screen;photoData:string;photoStorageId:string|null;plantName:string;setPlantName:(v:string)=>void;identifyResult:any;added:boolean;setAdded:(v:boolean)=>void;go:(s:Screen)=>void;back:()=>void}) {
  const {isLoaded,isSignedIn}=useUser();
  const addPlant=useMutation(api.plants.add);
  const generateUploadUrl=useMutation(api.userData.generateUploadUrl);
  const [name,setName]=useState(plantName);
  const [species,setSpecies]=useState(identifyResult?.scientificName||"");
  const [notes,setNotes]=useState([...(identifyResult?.visibleClues||[]),...(identifyResult?.caveats||[])].join("\n"));
  const [location,setLocation]=useState("");
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    setName(plantName);
    setSpecies(identifyResult?.scientificName||"");
    setNotes([...(identifyResult?.visibleClues||[]),...(identifyResult?.caveats||[])].join("\n"));
    setLocation("");
    setSaved(false);
    setError("");
  },[plantName,identifyResult,photoData]);

  const savePlant=async()=>{
    if(!isLoaded){setError("Please wait while sign-in status loads.");return;}
    if(!isSignedIn){setError("Sign in to save this plant to My Plants.");return;}
    if(!name.trim()){setError("Enter a plant name before saving.");return;}
    setSaving(true);setError("");
    try{
      let imageStorageId=photoStorageId as Id<"_storage">|null;
      if(!imageStorageId&&photoData){
        const blob=await (await fetch(photoData)).blob();
        const uploadUrl=await generateUploadUrl();
        const upload=await fetch(uploadUrl,{method:"POST",headers:{"Content-Type":blob.type||"image/jpeg"},body:blob});
        if(!upload.ok)throw new Error("Could not upload the plant photo. Please try again.");
        const stored=await upload.json();
        if(!stored.storageId)throw new Error("Photo upload did not return a storage ID.");
        imageStorageId=stored.storageId as Id<"_storage">;
      }
      await addPlant({
        name:name.trim(),
        species:species.trim()||undefined,
        notes:notes.trim()||undefined,
        location:location.trim()||undefined,
        plantedAt:Date.now(),
        imageStorageId:imageStorageId||undefined
      });
      setPlantName(name.trim());
      setAdded(true);
      setSaved(true);
      go("plants");
    }catch(e){
      setError(e instanceof Error?e.message:"Could not save plant.");
    }finally{
      setSaving(false);
    }
  };

  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES}/>
      <main className="flex-1 space-y-4 px-4 pb-6 pt-4">
        {photoData?<img src={photoData} alt="Plant awaiting confirmation" className="h-56 w-full rounded-2xl object-cover"/>:<Photo label="Identified plant image" height="h-56" emoji="🌱"/>}
        <div><h1 className="text-xl font-bold">Confirm your plant</h1><p className="mt-1 text-xs text-gray-500">Review the AI identification and edit any details before adding it to your garden.</p></div>
        <Card className="space-y-3 p-4">
          <label className="block text-xs font-semibold">Plant name
            <input value={name} onChange={e=>{setName(e.target.value);setSaved(false);}} className="mt-1 w-full rounded-xl border border-[#dce6dc] px-3 py-2 text-sm outline-none focus:border-[#087a43]"/>
          </label>
          <label className="block text-xs font-semibold">Scientific name
            <input value={species} onChange={e=>setSpecies(e.target.value)} placeholder="Not identified" className="mt-1 w-full rounded-xl border border-[#dce6dc] px-3 py-2 text-sm italic outline-none focus:border-[#087a43]"/>
          </label>
          <label className="block text-xs font-semibold">Plant details and AI observations
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-[#dce6dc] px-3 py-2 text-xs leading-5 outline-none focus:border-[#087a43]"/>
          </label>
          <label className="block text-xs font-semibold">Location in your garden (optional)
            <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Balcony, backyard" className="mt-1 w-full rounded-xl border border-[#dce6dc] px-3 py-2 text-sm outline-none focus:border-[#087a43]"/>
          </label>
          <div className="flex items-center justify-between rounded-xl bg-[#f0f7ef] p-3">
            <div><p className="text-[10px] text-gray-500">AI confidence</p><b className="text-lg text-[#087a43]">{identifyResult?.confidence!=null?identifyResult.confidence+"%":"Not provided"}</b></div>
            <PencilLine className="text-[#087a43]" size={20}/>
          </div>
        </Card>
        <Card className="p-4"><b className="text-sm">Identification notes</b><p className="mt-2 text-xs leading-5 text-gray-600">{identifyResult?.visibleClues?.length?identifyResult.visibleClues.join("; "):"AI identification is an estimate. Review the details before saving."}</p>{identifyResult?.caveats?.length>0&&<p className="mt-2 text-xs text-amber-700">{identifyResult.caveats.join(" ")}</p>}</Card>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={()=>go("scanner")} className="rounded-xl bg-[#e0f0e2] py-3 text-xs font-bold text-[#087a43]">Retake photo</button>
          <button disabled={saving||saved||!isLoaded} onClick={savePlant} className="flex items-center justify-center gap-2 rounded-xl bg-[#087a43] py-3 text-xs font-bold text-white disabled:opacity-60"><Save size={15}/>{saving?"Saving…":saved?"Saved to My Plants":"Confirm & Add"}</button>
        </div>
        {error&&<p role="alert" className="text-xs text-amber-700">{error}</p>}
        {!isLoaded&&<p className="text-center text-[10px] text-gray-500">Checking sign-in status…</p>}
      </main>
    </>
  );
}
