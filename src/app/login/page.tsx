import type { Metadata } from "next";
import { LoginFlow } from "@/components/LoginFlow";

export const metadata: Metadata = { title: "Join tuftly" };

export default function LoginPage() {
  return <LoginFlow />;
}
