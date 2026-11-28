import type { Metadata } from "next";
import { PitchBuilder } from "@/components/PitchBuilder";

export const metadata: Metadata = { title: "Your pitch" };

export default function PitchPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="font-pixel text-3xl font-bold text-ink">Your pitch</h1>
      <PitchBuilder />
    </div>
  );
}
