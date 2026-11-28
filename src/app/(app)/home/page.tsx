import type { Metadata } from "next";
import { QuestHome } from "@/components/QuestHome";

export const metadata: Metadata = { title: "Quest map" };

export default function HomePage() {
  return <QuestHome />;
}
