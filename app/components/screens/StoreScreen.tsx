"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {Header} from "../ui/Header";
import {Pill} from "../ui/Pill";
import {Card} from "../ui/Card";
import {BottomNav} from "../ui/BottomNav";
import {products} from "../shared/data";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

const catalogue: Record<string, string[][]> = {
  Fertilizers: products,
  Seeds: [["Tomato Seeds", "Hybrid high-yield variety", "₹ 120", "🍅"], ["Spinach Seeds", "Fast-growing leafy greens", "₹ 80", "🥬"]],
  Tools: [["Garden Hand Trowel", "Stainless steel tool", "₹ 199", "🛠️"], ["Watering Can", "Indoor and outdoor use", "₹ 249", "🚿"]],
  Pesticides: [["Neem Oil", "Organic garden care", "₹ 150", "🧴"], ["Sticky Traps", "Monitor flying pests", "₹ 99", "🟨"]]
};

export function StoreScreen({screen, go, back, storeTab, setStoreTab, cartCount, setCartCount}:{screen: Screen; go: (s: Screen) => void; back: () => void; storeTab: string; setStoreTab: (v: string) => void; cartCount: number; setCartCount: (v: number) => void}) {
  const {isLoaded,isSignedIn}=useUser();
  const items=useQuery(api.userData.cart,isLoaded&&isSignedIn?{}:"skip");
  const setQuantity=useMutation(api.userData.setCartQuantity);
  const total=(items||[]).reduce((sum,item)=>sum+item.quantity,0);
  const change=async(p:string[],delta:number)=>{
    if(!isSignedIn){alert("Sign in to save your cart.");return;}
    const key=p[0].toLowerCase().replace(/[^a-z0-9]+/g,"-");
    const existing=items?.find(x=>x.productKey===key);
    try{await setQuantity({productKey:key,name:p[0],price:p[2],emoji:p[3],quantity:(existing?.quantity||0)+delta});setCartCount(total+1);}
    catch{alert("Could not update this cart item. Please try again.");}
  };
  return (
    <>
      <Header backable={false} screen={screen} go={go} back={back} cartCount={total} title={SCREEN_TITLES} />
      <main className="flex-1 px-4 pb-5 pt-4">
        <div className="mb-4 flex gap-2 overflow-x-auto">{["Fertilizers", "Seeds", "Tools", "Pesticides"].map((t) => <Pill key={t} active={storeTab === t} onClick={() => setStoreTab(t)}>{t}</Pill>)}</div>
        <div className="space-y-3">
          {(catalogue[storeTab]||products).map((p) => {const key=p[0].toLowerCase().replace(/[^a-z0-9]+/g,"-");const quantity=items?.find(x=>x.productKey===key)?.quantity||0;return <Card key={key} className="flex items-center gap-3 p-3"><div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-[#f1f5ee] text-4xl">{p[3]}</div><div className="min-w-0 flex-1"><b className="text-xs">{p[0]}</b><p className="mt-1 text-[10px] text-gray-500">{p[1]}</p><b className="mt-2 block text-xs">{p[2]}</b>{quantity>0&&<p className="mt-1 text-[10px] text-green-700">In cart: {quantity}</p>}</div><div className="flex items-center gap-2"><button aria-label="Remove one from cart" disabled={quantity===0} onClick={()=>change(p,-1)} className="rounded-lg border px-2 py-2 text-xs disabled:opacity-30">−</button><span className="min-w-3 text-center text-xs">{quantity}</span><button onClick={()=>change(p,1)} className="rounded-lg bg-[#087a43] px-2 py-2 text-xs font-bold text-white">+</button></div></Card>})}
        </div>
        {!isLoaded||!isSignedIn?<p className="mt-3 text-[11px] text-gray-500">Sign in to keep your cart between sessions.</p>:null}
      </main>
      <BottomNav screen={screen} go={go} />
    </>
  );
}