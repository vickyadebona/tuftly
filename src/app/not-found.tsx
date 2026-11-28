import type { Metadata } from "next";
import Link from "next/link";
import { PixelArtBobbin } from "@/components/PixelArtBobbin";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-sky px-5 text-center">
      <PixelArtBobbin mood="thinking" size={160} />
      <h1 className="font-pixel text-3xl font-bold text-ink">This page flew off</h1>
      <p className="max-w-sm text-lg text-ink-soft">I couldn&apos;t find anything at this address. Let&apos;s head back.</p>
      <Link href="/" className="btn-primary">
        Back to tuftly
      </Link>
    </main>
  );
}
