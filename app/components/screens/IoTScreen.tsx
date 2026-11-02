"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Activity, Cpu, MapPin, Plus, Thermometer, Droplets, Wifi, WifiOff, FlaskConical } from "lucide-react";
import { Header } from "../ui/Header";
import { Card } from "../ui/Card";
import { SCREEN_TITLES, type Screen } from "../shared/types";

const prototypeSamples = [
  { id:"demo-1", at:"10:00", soil:25.8, humidity:66 },
  { id:"demo-2", at:"10:05", soil:26.1, humidity:65 },
  { id:"demo-3", at:"10:10", soil:26.4, humidity:67 },
  { id:"demo-4", at:"10:15", soil:26.7, humidity:68 },
  { id:"demo-5", at:"10:20", soil:26.5, humidity:69 },
  { id:"demo-6", at:"10:25", soil:26.3, humidity:68 },
];

export function IoTScreen({ screen, go, back }: { screen: Screen; go: (s: Screen) => void; back: () => void }) {
  const { isLoaded, isSignedIn } = useUser();
  const fields = useQuery(api.iot.listFields, isLoaded && isSignedIn ? {} : "skip");
  const createField = useMutation(api.iot.createField);
  const registerDevice = useMutation(api.iot.registerDevice);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [soilType, setSoilType] = useState("");
  const [deviceName, setDeviceName] = useState("ESP32-S3");
  const [deviceCode, setDeviceCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const devices = useQuery(api.iot.listDevices, selectedField ? { fieldId: selectedField._id } : "skip");
  const readings = useQuery(api.iot.latestReadings, selectedField ? { fieldId: selectedField._id, limit: 48 } : "skip");
  const latest = readings?.[0];
  const sortedReadings = useMemo(() => readings ? [...readings].reverse() : [], [readings]);
  const hasLiveReadings = Boolean(readings?.length);
  const previewRows = hasLiveReadings ? sortedReadings.slice(-6).map((r:any,i:number)=>({id:r._id,at:new Date(r.recordedAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}),soil:r.soilTemperatureC,humidity:r.airHumidity})) : prototypeSamples;

  async function saveField(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const id = await createField({ name: fieldName, latitude: Number(latitude), longitude: Number(longitude), address: address || undefined, soilType: soilType || undefined });
      setFieldName(""); setLatitude(""); setLongitude(""); setAddress(""); setSoilType(""); setShowFieldForm(false);
      setSelectedField({ _id: id, name: fieldName, location: { latitude: Number(latitude), longitude: Number(longitude) }, address, soilType });
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create field."); }
    finally { setSaving(false); }
  }

  async function saveDevice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!selectedField) return; setSaving(true); setError("");
    try {
      await registerDevice({ fieldId: selectedField._id, deviceName, deviceCode: deviceCode.trim() });
      setDeviceName("ESP32-S3"); setDeviceCode(""); setShowDeviceForm(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not register device."); }
    finally { setSaving(false); }
  }

  return <>
    <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
    <main className="flex-1 space-y-4 px-4 pb-6 pt-4">
      <div><h1 className="text-lg font-bold">Field sensor dashboard</h1><p className="text-xs text-gray-500">Prototype monitors soil temperature and surrounding-air humidity from your sensor setup.</p></div>
      {!isLoaded ? <p className="text-sm text-gray-500">Loading account…</p> : !isSignedIn ? <Card className="p-4 text-sm">Sign in to register fields and view your sensor data.</Card> : <>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <div className="flex items-center justify-between"><b className="text-sm">Your fields</b><button onClick={() => setShowFieldForm(v => !v)} className="flex items-center gap-1 rounded-xl bg-[#087a43] px-3 py-2 text-xs font-bold text-white"><Plus size={14}/> Add field</button></div>
        {fields === undefined ? <p className="text-xs text-gray-500">Loading fields…</p> : fields.length ? <div className="flex gap-2 overflow-x-auto pb-1">{fields.map((field: any) => <button key={field._id} onClick={() => setSelectedField(field)} className={`min-w-36 rounded-xl border p-3 text-left ${selectedField?._id === field._id ? "border-[#087a43] bg-[#edf6ed]" : "border-[#e2e9e1] bg-white"}`}><MapPin size={16} className="text-[#087a43]"/><b className="mt-1 block text-xs">{field.name}</b><span className="text-[10px] text-gray-500">{field.soilType || "Soil type not set"}</span></button>)}</div> : <Card className="p-4 text-xs text-gray-600">No fields registered yet. Add your first field to connect an ESP32.</Card>}
        {showFieldForm && <Card className="p-4"><form onSubmit={saveField} className="space-y-2"><b className="text-sm">Register a field</b><input required value={fieldName} onChange={e=>setFieldName(e.target.value)} placeholder="Field name" className="w-full rounded-lg border p-2 text-xs"/><div className="grid grid-cols-2 gap-2"><input required type="number" step="any" value={latitude} onChange={e=>setLatitude(e.target.value)} placeholder="Latitude" className="w-full rounded-lg border p-2 text-xs"/><input required type="number" step="any" value={longitude} onChange={e=>setLongitude(e.target.value)} placeholder="Longitude" className="w-full rounded-lg border p-2 text-xs"/></div><input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address label (optional)" className="w-full rounded-lg border p-2 text-xs"/><input value={soilType} onChange={e=>setSoilType(e.target.value)} placeholder="Soil type (optional)" className="w-full rounded-lg border p-2 text-xs"/><button disabled={saving} className="rounded-lg bg-[#087a43] px-3 py-2 text-xs font-bold text-white">{saving?"Saving…":"Save field"}</button></form></Card>}
        {selectedField && <>
          <div className="flex items-center justify-between"><div><b className="text-sm">{selectedField.name}</b><p className="text-[10px] text-gray-500">{selectedField.address || `${selectedField.location.latitude}, ${selectedField.location.longitude}`}</p></div><button onClick={()=>setShowDeviceForm(v=>!v)} className="rounded-xl border border-[#dce6dc] px-3 py-2 text-xs font-semibold"><Plus size={13} className="mr-1 inline"/> Connect device</button></div>
          {showDeviceForm && <Card className="p-4"><form onSubmit={saveDevice} className="space-y-2"><b className="text-sm">Register ESP32-S3</b><input value={deviceName} onChange={e=>setDeviceName(e.target.value)} placeholder="Device name" className="w-full rounded-lg border p-2 text-xs"/><input required minLength={6} maxLength={64} value={deviceCode} onChange={e=>setDeviceCode(e.target.value)} placeholder="Device code (same value in firmware)" className="w-full rounded-lg border p-2 text-xs"/><p className="text-[10px] text-gray-500">This code identifies the field. It is not a password; keep the public-ingestion risk in mind.</p><button disabled={saving} className="rounded-lg bg-[#087a43] px-3 py-2 text-xs font-bold text-white">{saving?"Saving…":"Register device"}</button></form></Card>}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4"><Thermometer size={18} className="text-orange-500"/><b className="mt-2 block text-2xl">{latest ? latest.soilTemperatureC.toFixed(1)+"°C" : "26.4°C"}</b><span className="text-[10px] text-gray-500">Soil temperature</span></Card>
            <Card className="p-4"><Droplets size={18} className="text-cyan-600"/><b className="mt-2 block text-2xl">{latest ? latest.airHumidity.toFixed(0)+"%" : "68%"}</b><span className="text-[10px] text-gray-500">Air humidity</span></Card>
          </div>
          {!hasLiveReadings&&<Card className="flex items-start gap-2 border-amber-200 bg-amber-50 p-3"><FlaskConical size={16} className="mt-0.5 shrink-0 text-amber-700"/><div><b className="text-xs text-amber-900">Prototype sample readings</b><p className="mt-1 text-[10px] leading-4 text-amber-800">26.4°C soil temperature and 68% air humidity are simulated demo values, not readings from connected hardware.</p></div></Card>}
          <Card className="p-4"><div className="flex items-center justify-between"><b className="text-sm">Device status</b><span className="text-[10px] text-gray-500">{devices?.length ?? 0} registered</span></div>{devices?.length ? devices.map((device:any)=><div key={device._id} className="mt-3 flex items-center justify-between border-t pt-3"><div className="flex items-center gap-2">{device.lastSeenAt && Date.now()-device.lastSeenAt < 90_000 ? <Wifi size={17} className="text-green-600"/>:<WifiOff size={17} className="text-gray-400"/>}<div><b className="block text-xs">{device.deviceName}</b><span className="text-[10px] text-gray-500">Last seen: {device.lastSeenAt?new Date(device.lastSeenAt).toLocaleString():"Never"}</span></div></div><span className="text-[10px] font-semibold capitalize">{device.lastSeenAt && Date.now()-device.lastSeenAt < 90_000 ? "online" : "offline"}</span></div>):<p className="mt-3 text-xs text-gray-500">No device connected to this field.</p>}</Card>
          <Card className="p-4"><div className="flex items-center gap-2"><Activity size={17} className="text-[#087a43]"/><b className="text-sm">Recent sensor history</b></div><p className="mt-1 text-[10px] text-gray-400">{hasLiveReadings?"Live device readings":"Illustrative prototype data · not stored in the database"}</p><div className="mt-3 space-y-2">{previewRows.slice().reverse().map((reading:any)=><div key={reading.id} className="flex items-center justify-between border-b border-gray-100 pb-2 text-[10px]"><span className="text-gray-500">{reading.at}</span><span>Soil {reading.soil.toFixed(1)}°C · Air humidity {reading.humidity.toFixed(0)}%</span></div>)}</div></Card>
        </>}
        {!selectedField && fields?.length ? <Card className="p-4 text-xs text-gray-500">Select a field above to view its connected device and sensor readings.</Card> : null}
      </>}
    </main>
  </>;
}
