"use client";

import {useEffect, useRef, useState} from "react";
import {Camera, ImageIcon} from "lucide-react";
import {Header} from "../ui/Header";
import {Photo} from "../ui/Photo";
import {SCREEN_TITLES} from "../shared/types";
import type {Screen} from "../shared/types";

export function ScannerScreen({screen, go, back, photoData, setPhotoData, aiLoading, serviceError, identifyPhoto}:{screen: Screen; go: (s: Screen) => void; back: () => void; photoData: string; setPhotoData: (v: string) => void; aiLoading: boolean; serviceError: string; identifyPhoto: () => void}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState("");

  useEffect(() => {
    if (screen !== "scanner" || photoData) return;
    let cancelled = false;
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Live camera is unavailable in this browser. Use the gallery button to upload a photo.");
        const stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: "environment"}, width: {ideal: 1280}, height: {ideal: 720}}, audio: false});
        if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }
        cameraStreamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
        setCameraError("");
      } catch (error: any) {
        if (!cancelled) setCameraError(error?.name === "NotAllowedError" ? "Camera permission was denied. Allow camera access in your browser settings, or upload from your gallery." : error?.message || "Could not open the camera. Use the gallery button instead.");
      }
    };
    startCamera();
    return () => {
      cancelled = true;
      if (cameraStreamRef.current) { cameraStreamRef.current.getTracks().forEach((track) => track.stop()); cameraStreamRef.current = null; }
    };
  }, [screen, photoData]);

  const captureCameraPhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) { document.getElementById("plant-camera-input")?.click(); return; }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) { setCameraError("Could not capture the image. Please use the gallery button."); return; }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotoData(canvas.toDataURL("image/jpeg", 0.88));
    setSelectedPhoto("Camera capture");
    setCameraError("");
  };

  const readPlantPhoto = (file?: File) => {
    if (!file) return;
    setSelectedPhoto(file.name);
    const reader = new FileReader();
    reader.onload = () => setPhotoData(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Header backable screen={screen} go={go} back={back} cartCount={0} title={SCREEN_TITLES} />
      <main className="flex-1 px-4 pb-6 pt-4">
        <div className="relative h-[390px] w-full overflow-hidden rounded-2xl bg-[#049140]">
          {photoData ? <img src={photoData} alt="Captured plant photo" className="h-full w-full object-cover" /> : (
            <>
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
              {cameraError && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#d1f5d8] px-6 text-center text-[#034d20]"><Camera size={42} /><p className="text-xs">{cameraError}</p></div>}
            </>
          )}
          <div className="pointer-events-none absolute inset-6 grid grid-cols-2 grid-rows-2">
            <span className="border-l-[3px] border-t-[3px] border-white rounded-tl-xl" />
            <span className="justify-self-end w-8 border-r-[3px] border-t-[3px] border-white rounded-tr-xl" />
            <span className="self-end border-l-[3px] border-b-[3px] border-white rounded-bl-xl" />
            <span className="w-8 justify-self-end self-end border-r-[3px] border-b-[3px] border-white rounded-br-xl" />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-center gap-8">
          <button onClick={() => photoData ? (setPhotoData(""), setSelectedPhoto("")) : captureCameraPhoto()} aria-label={photoData ? "Retake photo" : "Capture photo"} className="grid h-[68px] w-[68px] place-items-center rounded-full border-[5px] border-[#dce9df] bg-white shadow-md"><span className="h-12 w-12 rounded-full bg-[#049140]" /></button>
          <input id="plant-camera-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => readPlantPhoto(e.target.files?.[0])} />
          <label className="grid h-12 w-12 cursor-pointer place-items-center rounded-xl bg-[#cdead4] text-[#049140]"><ImageIcon /><input type="file" accept="image/*" className="hidden" onChange={(e) => readPlantPhoto(e.target.files?.[0])} /></label>
        </div>
        <p className="mt-5 text-center text-xs text-[#035920]">{selectedPhoto ? `Photo ready: ${selectedPhoto} · Tap shutter to retake` : "Live camera preview · Tap the green shutter to capture, or use the gallery icon."}</p>
        <button onClick={identifyPhoto} disabled={aiLoading} className="mt-5 w-full rounded-xl bg-[#049140] py-3 text-sm font-bold text-white">{aiLoading ? "Identifying…" : "Identify Plant"}</button>
        {serviceError && <p className="mt-2 text-center text-xs text-red-600">{serviceError}</p>}
        {selectedPhoto && <p className="mt-2 text-center text-[10px] text-gray-500">Selected: {selectedPhoto}</p>}
      </main>
    </>
  );
}
