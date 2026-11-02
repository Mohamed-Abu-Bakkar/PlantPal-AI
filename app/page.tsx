"use client";
import {useEffect, useState} from "react";
import {useUser} from "@clerk/nextjs";
import {useMutation,useQuery} from "convex/react";
import {api} from "../convex/_generated/api";
import {Splash} from "./components/ui/Splash";
import {HomeScreen} from "./components/screens/HomeScreen";
import {ScannerScreen} from "./components/screens/ScannerScreen";
import {ResultScreen} from "./components/screens/ResultScreen";
import {CareScreen} from "./components/screens/CareScreen";
import {WeatherScreen} from "./components/screens/WeatherScreen";
import {HealthScreen} from "./components/screens/HealthScreen";
import {SuitabilityScreen} from "./components/screens/SuitabilityScreen";
import {StoreScreen} from "./components/screens/StoreScreen";
import {PlantsScreen} from "./components/screens/PlantsScreen";
import {AlertsScreen} from "./components/screens/AlertsScreen";
import {AssistantScreen} from "./components/screens/AssistantScreen";
import {DetailsScreen} from "./components/screens/DetailsScreen";
import type {Screen} from "./components/shared/types";

export default function Home() {
  const {isLoaded,isSignedIn}=useUser();
  const savedChat=useQuery(api.userData.chatHistory,isLoaded&&isSignedIn?{}:"skip");
  const saveChatMessage=useMutation(api.userData.saveChatMessage);
  const generateUploadUrl=useMutation(api.userData.generateUploadUrl);
  const saveScan=useMutation(api.userData.saveScan);
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setShowSplash(false), 2600); return () => window.clearTimeout(timer); }, []);
  const [screen,setScreen]=useState<Screen>("home");
  const [careTab,setCareTab]=useState("Overview");
  const [storeTab,setStoreTab]=useState("Fertilizers");
  const [search,setSearch]=useState("Mango");
  const [plantName,setPlantName]=useState("Tomato");
  const [added,setAdded]=useState(false);
  const [chat,setChat]=useState("");
  const [messages,setMessages]=useState(["Hello! I’m your PlantPal AI assistant. Ask me anything about your garden."]);
  const [photoData,setPhotoData]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [weather,setWeather]=useState<any>(null);
  const [weatherLoading,setWeatherLoading]=useState(false);
  const [serviceError,setServiceError]=useState("");
  const [screenHistory,setScreenHistory]=useState<Screen[]>([]);
  const [identifyResult,setIdentifyResult]=useState<any>(null);
  const [cartCount,setCartCount]=useState(0);
  const go=(s:Screen)=>{if(s===screen)return;setScreenHistory(h=>[...h,screen]);setScreen(s);};
  const back=()=>{const prior=screenHistory[screenHistory.length-1]||"home";setScreenHistory(h=>h.slice(0,-1));setScreen(prior);};

  const identifyPhoto=async()=>{
    if(!photoData){setServiceError("Choose a plant photo first.");return;}
    setAiLoading(true);setServiceError("");
    try{
      const r=await fetch("/api/identify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:photoData})});
      const d=await r.json();if(!r.ok)throw new Error(d.error||"Identification failed");
      const x=d.result;const result=typeof x==="object"?x:null;
      const commonName=result?.commonName|| (typeof x==="string"?String(x).slice(0,60):"Identified plant");
      setIdentifyResult(result);setPlantName(commonName);
      if(isSignedIn){
        try{
          const blob=await (await fetch(photoData)).blob();
          const uploadUrl=await generateUploadUrl();
          const upload=await fetch(uploadUrl,{method:"POST",headers:{"Content-Type":blob.type||"image/jpeg"},body:blob});
          if(!upload.ok)throw new Error("Photo upload failed");
          const stored=await upload.json();
          await saveScan({plantName:commonName,scientificName:result?.scientificName||undefined,confidence:typeof result?.confidence==="number"?result.confidence:undefined,visibleClues:Array.isArray(result?.visibleClues)?result.visibleClues:[],caveats:Array.isArray(result?.caveats)?result.caveats:[],imageStorageId:stored.storageId});
        }catch(storageError){setServiceError(storageError instanceof Error?storageError.message:"Could not save scan history.");}
      }
      go("result");
    }catch(e){setServiceError(e instanceof Error?e.message:"Identification failed.");}
    finally{setAiLoading(false);}
  };

  const sendChat=async(e:React.FormEvent)=>{
    e.preventDefault();const prompt=chat.trim();if(!prompt||aiLoading)return;
    const history=(savedChat||[]).slice(-20).map(m=>({role:m.role,content:m.content}));
    const fallback=messages.slice(1).map((content,i)=>({role:i%2===0?"user":"assistant",content}));
    const conversation=history.length?history:fallback;
    conversation.push({role:"user",content:prompt});
    setMessages(m=>[...m,prompt]);setChat("");setAiLoading(true);setServiceError("");
    if(isSignedIn)try{await saveChatMessage({role:"user",content:prompt});}catch{}
    try{
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:conversation})});
      const d=await r.json();if(!r.ok)throw new Error(d.error||"AI request failed");
      setMessages(m=>[...m,d.reply]);
      if(isSignedIn)try{await saveChatMessage({role:"assistant",content:d.reply});}catch{}
    }catch(e){setServiceError(e instanceof Error?e.message:"AI request failed.");}
    finally{setAiLoading(false);}
  };

  const loadWeather=async()=>{
    setWeatherLoading(true);setServiceError("");
    try{
      const pos=await new Promise<GeolocationPosition>((resolve,reject)=>navigator.geolocation?navigator.geolocation.getCurrentPosition(resolve,reject,{timeout:10000}):reject(new Error("Location is unavailable.")));
      const r=await fetch("/api/weather?lat="+pos.coords.latitude+"&lon="+pos.coords.longitude);const d=await r.json();if(!r.ok)throw new Error(d.error||"Weather request failed");setWeather(d);
    }catch(e){setServiceError(e instanceof Error?e.message:"Weather request failed.");}
    finally{setWeatherLoading(false);}
  };

  if(showSplash)return <Splash/>;
  const displayedMessages=savedChat?.length?savedChat.map(m=>m.content):messages;
  return (
    <div className="min-h-screen bg-[#edf2eb] text-[#18251c]"><div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#fbfcf8] shadow-[0_0_40px_rgba(30,65,35,.1)]">
      {screen==="home"&&<HomeScreen go={go} plantName={plantName} setPlantName={setPlantName} added={added} setAdded={setAdded}/>}
      {screen==="scanner"&&<ScannerScreen screen={screen} go={go} back={back} photoData={photoData} setPhotoData={setPhotoData} aiLoading={aiLoading} serviceError={serviceError} identifyPhoto={identifyPhoto}/>}
      {screen==="result"&&<ResultScreen screen={screen} photoData={photoData} plantName={plantName} identifyResult={identifyResult} added={added} setAdded={setAdded} go={go} back={back}/>}
      {screen==="care"&&<CareScreen screen={screen} go={go} back={back} careTab={careTab} setCareTab={setCareTab}/>}
      {screen==="weather"&&<WeatherScreen screen={screen} go={go} back={back} weather={weather} weatherLoading={weatherLoading} serviceError={serviceError} loadWeather={loadWeather}/>}
      {screen==="health"&&<HealthScreen screen={screen} go={go} back={back}/>}
      {screen==="suitability"&&<SuitabilityScreen screen={screen} go={go} back={back} search={search} setSearch={setSearch} plantName={plantName} setPlantName={setPlantName} added={added} setAdded={setAdded}/>}
      {screen==="store"&&<StoreScreen screen={screen} go={go} back={back} storeTab={storeTab} setStoreTab={setStoreTab} cartCount={cartCount} setCartCount={setCartCount}/>}
      {screen==="plants"&&<PlantsScreen screen={screen} go={go} back={back} plantName={plantName} setPlantName={setPlantName}/>}
      {screen==="alerts"&&<AlertsScreen screen={screen} go={go} back={back}/>}
      {screen==="assistant"&&<AssistantScreen screen={screen} go={go} back={back} chat={chat} setChat={setChat} messages={displayedMessages} setMessages={setMessages} aiLoading={aiLoading} serviceError={serviceError} setServiceError={setServiceError} sendChat={sendChat}/>}
      {screen==="details"&&<DetailsScreen screen={screen} go={go} back={back} plantName={plantName} added={added} setAdded={setAdded}/>}
    </div></div>
  );
}