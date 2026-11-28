import type { Metadata } from "next";
import { InterviewRound } from "@/components/InterviewRound";

export const metadata: Metadata = { title: "Interviews" };

export default function InterviewPage() {
  return <InterviewRound />;
}
