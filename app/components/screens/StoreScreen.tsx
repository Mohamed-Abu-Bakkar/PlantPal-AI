"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Header } from "../ui/Header";
import { Pill } from "../ui/Pill";
import { Card } from "../ui/Card";
import { BottomNav } from "../ui/BottomNav";
import { SCREEN_TITLES } from "../shared/types";
import type { Screen } from "../shared/types";

const categories = ["Fertilizers", "Seeds", "Tools", "Pesticides"];
type Supply = { _id: Id<"supplyCatalog">; name: string; description: string; price: string; category: string; emoji: string; imageStorageId?: Id<"_storage">; productKey: string };
type Draft = { name: string; description: string; price: string; category: string; emoji: string; imageStorageId?: Id<"_storage"> };
const blankDraft: Draft = { name: "", description: "", price: "", category: "Fertilizers", emoji: "🌱" };

function SupplyArtwork({ supply }: { supply: Supply }) {
  const imageUrl = useQuery(api.userData.getImageUrl, supply.imageStorageId ? { storageId: supply.imageStorageId } : "skip");
  if (imageUrl) return <img src={imageUrl} alt={supply.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />;
  return <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f1f5ee]" aria-label={supply.name + " image placeholder"}>
    <svg viewBox="0 0 100 100" role="img" className="h-full w-full">
      <rect width="100" height="100" rx="14" fill="#edf5e9" />
      <path d="M50 72V42" stroke="#4c8b57" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 53C26 54 22 36 25 25c17 0 29 8 25 28Z" fill="#8fc58c" />
      <path d="M50 46c1-17 14-25 29-23 1 17-9 28-29 23Z" fill="#5da66d" />
      <text x="50" y="91" textAnchor="middle" fontSize="10" fill="#476b4a">{supply.emoji}</text>
    </svg>
  </div>;
}

export function StoreScreen({ screen, go, back, storeTab, setStoreTab, cartCount, setCartCount }: { screen: Screen; go: (s: Screen) => void; back: () => void; storeTab: string; setStoreTab: (v: string) => void; cartCount: number; setCartCount: (v: number) => void }) {
  const { isLoaded, isSignedIn } = useUser();
  const products = useQuery(api.catalogue.list, {});
  const items = useQuery(api.userData.cart, isLoaded && isSignedIn ? {} : "skip");
  const seed = useMutation(api.catalogue.seedStarterSupplies);
  const addSupply = useMutation(api.catalogue.add);
  const updateSupply = useMutation(api.catalogue.update);
  const removeSupply = useMutation(api.catalogue.remove);
  const setQuantity = useMutation(api.userData.setCartQuantity);
  const generateUploadUrl = useMutation(api.userData.generateUploadUrl);
  const [editingId, setEditingId] = useState<Id<"supplyCatalog"> | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = (items || []).reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => { seed({}).catch(() => setError("Could not initialize the supplies catalogue.")); }, [seed]);

  const startHold = (supply: Supply) => {
    if (!isSignedIn) return;
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      setDraft({ name: supply.name, description: supply.description, price: supply.price, category: supply.category, emoji: supply.emoji, imageStorageId: supply.imageStorageId });
      setPhoto(null); setEditingId(supply._id); setError("");
    }, 650);
  };
  const cancelHold = () => { if (holdTimer.current) clearTimeout(holdTimer.current); holdTimer.current = null; };
  const openNew = () => { setDraft(blankDraft); setPhoto(null); setEditingId("new"); setError(""); };
  const changeCart = async (supply: Supply, delta: number) => {
    if (!isSignedIn) { alert("Sign in to save your cart."); return; }
    const quantity = items?.find(item => item.productKey === supply.productKey)?.quantity || 0;
    try { await setQuantity({ productKey: supply.productKey, name: supply.name, price: supply.price, emoji: supply.emoji, quantity: quantity + delta }); setCartCount(Math.max(0, total + delta)); }
    catch { setError("Could not update your cart. Please try again."); }
  };
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSignedIn || !draft.name.trim() || !draft.price.trim()) return;
    setSaving(true); setError("");
    try {
      let imageStorageId = draft.imageStorageId;
      if (photo) {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": photo.type || "image/jpeg" }, body: photo });
        if (!response.ok) throw new Error("Photo upload failed.");
        const uploaded = await response.json();
        imageStorageId = uploaded.storageId;
      }
      const payload = { name: draft.name.trim(), description: draft.description.trim(), price: draft.price.trim(), category: draft.category, emoji: draft.emoji.trim() || "🌱", imageStorageId };
      if (editingId === "new") await addSupply(payload);
      else if (editingId) await updateSupply({ id: editingId, ...payload });
      setEditingId(null); setDraft(blankDraft); setPhoto(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save this supply."); }
    finally { setSaving(false); }
  };
  const deleteSupply = async (id: Id<"supplyCatalog">) => {
    if (!confirm("Delete this supply from the shared catalogue for everyone?")) return;
    try { await removeSupply({ id }); setEditingId(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete this supply."); }
  };
  const visible = (products || []).filter((s: Supply) => s.category === storeTab);
  return (
    <>
      <Header backable={false} screen={screen} go={go} back={back} cartCount={total} title={SCREEN_TITLES} />
      <main className="flex-1 px-4 pb-5 pt-4">
        <div className="mb-4 flex gap-2 overflow-x-auto">{categories.map(category => <Pill key={category} active={storeTab === category} onClick={() => setStoreTab(category)}>{category}</Pill>)}</div>
        {isSignedIn && <button onClick={openNew} className="mb-3 w-full rounded-xl border border-dashed border-[#78a77e] py-3 text-xs font-bold text-[#087a43]">＋ Add supply to shared catalogue</button>}
        <p className="mb-3 text-[10px] text-gray-500">{isSignedIn ? "Long-press any supply card to edit or delete it. Changes are shared with everyone." : "Browse the community supplies catalogue. Sign in to add or edit supplies."}</p>
        {products === undefined ? <p className="py-8 text-center text-xs text-gray-500">Loading supplies…</p> : visible.length ? <div className="space-y-3">
          {visible.map((supply: Supply) => {
            const quantity = items?.find(item => item.productKey === supply.productKey)?.quantity || 0;
            return <div key={supply._id} onContextMenu={event => { event.preventDefault(); if (isSignedIn) { setDraft({ name: supply.name, description: supply.description, price: supply.price, category: supply.category, emoji: supply.emoji, imageStorageId: supply.imageStorageId }); setEditingId(supply._id); } }} onTouchStart={() => startHold(supply)} onTouchEnd={cancelHold} onTouchMove={cancelHold} onMouseDown={() => startHold(supply)} onMouseUp={cancelHold} onMouseLeave={cancelHold}>
              <Card className="flex items-center gap-3 p-3"><SupplyArtwork supply={supply}/><div className="min-w-0 flex-1"><b className="text-xs">{supply.name}</b><p className="mt-1 text-[10px] text-gray-500">{supply.description}</p><b className="mt-2 block text-xs">{supply.price}</b>{quantity > 0 && <p className="mt-1 text-[10px] text-green-700">In cart: {quantity}</p>}</div><div className="flex items-center gap-2"><button aria-label="Remove one from cart" disabled={quantity === 0} onClick={() => changeCart(supply, -1)} className="rounded-lg border px-2 py-2 text-xs disabled:opacity-30">−</button><span className="min-w-3 text-center text-xs">{quantity}</span><button onClick={() => changeCart(supply, 1)} className="rounded-lg bg-[#087a43] px-2 py-2 text-xs font-bold text-white">+</button></div></Card>
            </div>;
          })}
        </div> : <Card className="p-6 text-center text-xs text-gray-500">No supplies in this category yet. Add the first one.</Card>}
        {!isLoaded || !isSignedIn ? <p className="mt-3 text-[11px] text-gray-500">Sign in to save your cart and contribute to the shared catalogue.</p> : null}
        {editingId && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center"><Card className="max-h-[85vh] w-full max-w-[410px] overflow-y-auto p-4"><div className="mb-3 flex items-center justify-between"><b className="text-sm">{editingId === "new" ? "Add supply" : "Edit shared supply"}</b><button onClick={() => setEditingId(null)} className="text-xs text-gray-500">Close</button></div><form onSubmit={save} className="space-y-3">
          <label className="block text-xs font-semibold">Name<input required value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="mt-1 w-full rounded-lg border p-2 text-sm"/></label>
          <label className="block text-xs font-semibold">Description<textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} className="mt-1 w-full rounded-lg border p-2 text-sm"/></label>
          <label className="block text-xs font-semibold">Price<input required value={draft.price} onChange={e => setDraft({ ...draft, price: e.target.value })} placeholder="₹ 150" className="mt-1 w-full rounded-lg border p-2 text-sm"/></label>
          <label className="block text-xs font-semibold">Category<select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} className="mt-1 w-full rounded-lg border p-2 text-sm">{categories.map(category => <option key={category}>{category}</option>)}</select></label>
          <label className="block text-xs font-semibold">Placeholder symbol<input value={draft.emoji} onChange={e => setDraft({ ...draft, emoji: e.target.value })} className="mt-1 w-full rounded-lg border p-2 text-sm"/></label>
          <label className="block text-xs font-semibold">Upload product photo<input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} className="mt-1 block w-full text-xs"/></label>
          <p className="text-[10px] text-gray-500">Until a photo is uploaded, this card uses a simple SVG plant placeholder.</p>
          <button disabled={saving} className="w-full rounded-xl bg-[#087a43] py-3 text-xs font-bold text-white">{saving ? "Saving…" : "Save shared changes"}</button>
          {editingId !== "new" && <button type="button" onClick={() => deleteSupply(editingId)} className="w-full rounded-xl border border-red-200 py-2 text-xs font-semibold text-red-600">Delete for everyone</button>}
        </form></Card></div>}
        {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
      </main>
      <BottomNav screen={screen} go={go}/>
    </>
  );
}
