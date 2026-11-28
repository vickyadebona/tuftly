import type { Metadata } from "next";
import { ReviewSession } from "@/components/ReviewSession";

export const metadata: Metadata = { title: "Practice" };

export default function ReviewPage() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-6">
      <h1 className="font-pixel text-3xl font-bold text-ink">Practice</h1>
      <ReviewSession />
    </div>
  );
}
