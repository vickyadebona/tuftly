import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginFlow } from "@/components/LoginFlow";
import { Skeleton } from "@/components/Skeleton";

export const metadata: Metadata = { title: "Join" };

async function LoginContent({ searchParams }: { searchParams: Promise<{ error?: string; mode?: string }> }) {
  const { error, mode } = await searchParams;
  return <LoginFlow linkError={error === "link"} startNew={mode === "new"} />;
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; mode?: string }> }) {
  return (
    <Suspense fallback={<Skeleton className="mx-auto mt-24 h-[420px] w-full max-w-md" />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}
