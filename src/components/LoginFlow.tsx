"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { continueAsGuest, createAccount, signOut, useAccount } from "@/lib/account";
import { useHydrated } from "@/lib/store";
import { useSeason } from "@/lib/useSeason";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { Skeleton } from "./Skeleton";

export function LoginFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const account = useAccount();
  const season = useSeason();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const shell = (children: React.ReactNode) => (
    <div className="flex min-h-screen flex-col bg-sky">
      <header className="px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2" aria-label="tuftly landing page">
          <PixelArtBobbin mood="sparkle" outfit={season} size={40} />
          <span className="font-pixel text-3xl font-bold text-ink">
            tuft<span className="text-teal">ly</span>
          </span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-12">{children}</main>
    </div>
  );

  if (!hydrated) {
    return shell(
      <div role="status" aria-busy="true" className="w-full max-w-md">
        <span className="sr-only">Loading</span>
        <Skeleton className="h-[420px] w-full" />
      </div>,
    );
  }

  // Someone already set up on this device.
  if (account) {
    return shell(
      <section className="pixel-box flex w-full max-w-md flex-col items-center gap-4 bg-paper p-8 text-center">
        <PixelArtBobbin mood="happy" outfit={season} size={140} />
        <h1 className="font-pixel text-3xl font-bold text-ink">
          Welcome back{account.guest ? "" : `, ${account.name}`}!
        </h1>
        <p className="text-lg text-ink-soft">Your progress is right where you left it.</p>
        <Link href="/home" className="btn-primary">
          Continue
        </Link>
        <button type="button" onClick={signOut} className="font-semibold text-teal-deep underline">
          Not you? Log out
        </button>
      </section>,
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 1) {
      setError("What should Bobbin call you?");
      return;
    }
    createAccount(name, email);
    router.push("/home");
  }

  return shell(
    <section className="pixel-box flex w-full max-w-md flex-col gap-5 bg-paper p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <PixelArtBobbin mood="sparkle" outfit={season} size={120} />
        <h1 className="font-pixel text-3xl font-bold text-ink">Hi, I&apos;m Bobbin!</h1>
        <p className="text-lg text-ink-soft">Let&apos;s set you up. It takes about ten seconds.</p>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 font-bold text-ink" htmlFor="name">
          What should I call you?
          <input
            id="name"
            name="name"
            autoComplete="given-name"
            maxLength={30}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "name-error" : undefined}
            className="border-[3px] border-line bg-paper p-3 font-normal text-ink"
          />
          {error && (
            <span id="name-error" role="alert" className="text-sm font-semibold text-orange">
              {error}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1 font-bold text-ink" htmlFor="email">
          Email <span className="font-normal text-ink-soft">(optional, for syncing later)</span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-[3px] border-line bg-paper p-3 font-normal text-ink"
          />
        </label>

        <button type="submit" className="btn-primary">
          Start my quest
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          continueAsGuest();
          router.push("/home");
        }}
        className="btn-secondary"
      >
        Continue as guest
      </button>

      <p className="text-center text-sm text-ink-soft">
        For now your profile and progress are saved on this device. Signing in to pick up on another
        device is coming.
      </p>
    </section>,
  );
}
