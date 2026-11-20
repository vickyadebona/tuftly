import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginFlow } from "@/components/LoginFlow";
import { Skeleton } from "@/components/Skeleton";

export const metadata: Metadata = { title: "Join tuftly" };

async function LoginContent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <LoginFlow linkError={error === "link"} />;
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <Suspense fallback={<Skeleton className="mx-auto mt-24 h-[420px] w-full max-w-md" />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}
