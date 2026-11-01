import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
export const metadata:Metadata={title:"PlantPal AI — Everyone, Anywhere Can Plant",description:"Your friendly AI gardening companion. Identify plants, understand your garden, and grow with confidence."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><ConvexClientProvider>{children}</ConvexClientProvider></body></html>;}
