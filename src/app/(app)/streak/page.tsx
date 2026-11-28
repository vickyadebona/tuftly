import type { Metadata } from "next";
import { StreakCalendar } from "@/components/StreakCalendar";

export const metadata: Metadata = { title: "Your streak" };

export default function StreakPage() {
  return <StreakCalendar />;
}
