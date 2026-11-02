import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#edf2eb] p-4"><div className="w-full max-w-3xl"><a href="/" className="mb-5 inline-flex text-sm font-semibold text-[#087a43]">← Back to PlantPal AI</a><UserProfile /></div></main>;
}
