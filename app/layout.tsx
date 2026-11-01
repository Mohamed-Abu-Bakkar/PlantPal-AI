import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { PWARegister } from "./PWARegister";
export const metadata:Metadata={title:"PlantPal AI — Everyone, Anywhere Can Plant",description:"Your friendly AI gardening companion. Identify plants, understand your garden, and grow with confidence.",manifest:"/manifest.webmanifest",applicationName:"PlantPal AI",appleWebApp:{capable:true,statusBarStyle:"default",title:"PlantPal"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><PWARegister/><ConvexClientProvider>{children}</ConvexClientProvider></body></html>;}
