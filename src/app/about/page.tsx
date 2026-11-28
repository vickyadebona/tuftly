import type { Metadata } from "next";
import { About } from "@/components/About";

export const metadata: Metadata = {
  title: "About",
  description: "Why tuftly exists, who it's for, and why it's free for now.",
};

export default function AboutPage() {
  return <About />;
}
