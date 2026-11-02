"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Activity, Cpu, MapPin, Plus, Thermometer, Droplets, Wind, Wifi, WifiOff } from "lucide-react";
import { Header } from "../ui/Header";
import { Card } from "../ui/Card";
import type { Screen } from "../shared/types";

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

  async function saveField(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const id = await createField({ name: fieldName, latitude: Number(latitude), longitude: Number(longitude), address: address || undefined, soilType: soilType || undefined });
      setFieldName(""); setLatitude(""); setLongitude(""); setAddress(""); setSoilType(""); setShowFieldForm(false);
      const created = fields?.find((f: any) => f._id === id);
      if (created) setSelectedField(created);
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
    <Header backable screen={screen} go={go} back={back} cartCount={0} title="IoT Field Monitor" />
    <main className="flex-1 space-y-4 px-4 pb-6 pt-4">
      <div><h1 className="text-lg font-bold">Field sensor dashboard</h1><p className="text-xs text-gray-500">Monitor soil and local air conditions from your ESP32-S3.</p></div>
      {!isLoaded ? <p className="text-sm text-gray-500">Loading account…</p> : !isSignedIn ? <Card className="p-4 text-sm">Sign in to register fields and view your sensor data.</Card> : <>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <div className="flex items-center justify-between"><b className="text-sm">Your fields</b><button onClick={() => setShowFieldForm(v => !v)} className="flex items-center gap-1 rounded-xl bg-[#087a43] px-3 py-2 text-xs font-bold text-white"><Plus size={14}/> Add field</button></div>
        {fields === undefined ? <p className="text-xs text-gray-500">Loading fields…</p> : fields.length ? <div className="flex gap-2 overflow-x-auto pb-1">{fields.map((field: any) => <button key={field._id} onClick={() => setSelectedField(field)} className={`min-w-36 rounded-xl border p-3 text-left ${selectedField?._id === field._id ? "border-[#087a43] bg-[#edf6ed]" : "border-[#e2e9e1] bg-white"}`}><MapPin size={16} className="text-[#087a43]"/><b className="mt-1 block text-xs">{field.name}</b><span className="text-[10px] text-gray-500">{field.soilType || "Soil type not set"}</span></button>)}</div> : <Card className="p-4 text-xs text-gray-600">No fields registered yet. Add your first field to connect an ESP32.</Card>}
        {showFieldForm && <Card className="p-4"><form onSubmit={saveField} className="space-y-2"><b className="text-sm">Register a field</b><input required value={fieldName} onChange={e=>setFieldName(e.target.value)} placeholder="Field name" className="w-full rounded-lg border p-2 text-xs"/><div className="grid grid-cols-2 gap-2"><input required type="number" step="any" value={latitude} onChange={e=>setLatitude(e.target.value)} placeholder="Latitude" className="w-full rounded-lg border p-2 text-xs"/><input required type="number" step="any" value={longitude} onChange={e=>setLongitude(e.target.value)} placeholder="Longitude" className="w-full rounded-lg border p-2 text-xs"/></div><input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address label (optional)" className="w-full rounded-lg border p-2 text-xs"/><input value={soilType} onChange={e=>setSoilType(e.target.value)} placeholder="Soil type (optional)" className="w-full rounded-lg border p-2 text-xs"/><button disabled={saving} className="rounded-lg bg-[#087a43] px-3 py-2 text-xs font-bold text-white">{saving?"Saving…":"Save field"}</button></form></Card>}
        {selectedField && <>
          <div className="flex items-center justify-between"><div><b className="text-sm">{selectedField.name}</b><p className="text-[10px] text-gray-500">{selectedField.address || `${selectedField.location.latitude}, ${selectedField.location.longitude}`}</p></div><button onClick={()=>setShowDeviceForm(v=>!v)} className="rounded-xl border border-[#dce6dc] px-3 py-2 text-xs font-semibold"><Plus size={13} className="mr-1 inline"/> Connect device</button></div>
          {showDeviceForm && <Card className="p-4"><form onSubmit={saveDevice} className="space-y-2"><b className="text-sm">Register ESP32-S3</b><input value={deviceName} onChange={e=>setDeviceName(e.target.value)} placeholder="Device name" className="w-full rounded-lg border p-2 text-xs"/><input required minLength={6} maxLength={64} value={deviceCode} onChange={e=>setDeviceCode(e.target.value)} placeholder="Device code (same value in firmware)" className="w-full rounded-lg border p-2 text-xs"/><p className="text-[10px] text-gray-500">This code identifies the field. It is not a password; keep the public-ingestion risk in mind.</p><button disabled={saving} className="rounded-lg bg-[#087a43] px-3 py-2 text-xs font-bold text-white">{saving?"Saving…":"Register device"}</button></form></Card>}
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-3"><Thermometer size={17} className="text-orange-500"/><b className="mt-2 block text-lg">{latest ? latest.soilTemperatureC.toFixed(1)+"°" : "--"}</b><span className="text-[10px] text-gray-500">Soil °C</span></Card>
            <Card className="p-3"><Wind size={17} className="text-blue-500"/><b className="mt-2 block text-lg">{latest ? latest.airTemperatureC.toFixed(1)+"°" : "--"}</b><span className="text-[10px] text-gray-500">Air °C</span></Card>
            <Card className="p-3"><Droplets size={17} className="text-cyan-600"/><b className="mt-2 block text-lg">{latest ? latest.airHumidity.toFixed(0)+"%" : "--"}</b><span className="text-[10px] text-gray-500">Humidity</span></Card>
          </div>
          <Card className="p-4"><div className="flex items-center justify-between"><b className="text-sm">Device status</b><span className="text-[10px] text-gray-500">{devices?.length ?? 0} registered</span></div>{devices?.length ? devices.map((device:any)=><div key={device._id} className="mt-3 flex items-center justify-between border-t pt-3"><div className="flex items-center gap-2">{device.status==="online"?<Wifi size={17} className="text-green-600"/>:<WifiOff size={17} className="text-gray-400"/>}<div><b className="block text-xs">{device.deviceName}</b><span className="text-[10px] text-gray-500">Last seen: {device.lastSeenAt?new Date(device.lastSeenAt).toLocaleString():"Never"}</span></div></div><span className="text-[10px] font-semibold capitalize">{device.status}</span></div>):<p className="mt-3 text-xs text-gray-500">No device connected to this field.</p>}</Card>
          <Card className="p-4"><div className="flex items-center gap-2"><Activity size={17} className="text-[#087a43]"/><b className="text-sm">Recent sensor history</b></div>{readings===undefined?<p className="mt-3 text-xs text-gray-500">Loading readings…</p>:sortedReadings.length?<div className="mt-3 space-y-2">{[...sortedReadings].reverse().slice(0,12).map((reading:any)=><div key={reading._id} className="flex items-center justify-between border-b border-gray-100 pb-2 text-[10px]"><span className="text-gray-500">{new Date(reading.recordedAt).toLocaleString()}</span><span>Soil {reading.soilTemperatureC.toFixed(1)}° · Air {reading.airTemperatureC.toFixed(1)}° · {reading.airHumidity.toFixed(0)}%</span></div>)}</div>:<p className="mt-3 text-xs text-gray-500">No readings yet. Once your ESP32 sends its first upload, live values and history will appear here.</p>}</Card>
        </>}
        {!selectedField && fields?.length ? <Card className="p-4 text-xs text-gray-500">Select a field above to view its connected device and sensor readings.</Card> : null}
      </>}
    </main>
  </>;
}
