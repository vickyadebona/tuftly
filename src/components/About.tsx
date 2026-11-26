import Link from "next/link";
import { APP_NAME, FIRST_LESSON_MINUTES } from "@/lib/config";
import { Eyebrow, Footer, INNER, Nav, SECTION, Title } from "./Landing";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { PixelIcon, type PixelIconName } from "./PixelIcon";

// DRAFT COPY: written from what the founder shared about why tuftly exists. Edit it so it
// sounds like you, and correct anything that isn't quite how it happened.

const WANTED: { icon: PixelIconName; color: string; title: string; text: string }[] = [
  {
    icon: "star",
    color: "#f2b93b",
    title: "Lessons that fit in a coffee break",
    text: "A few minutes each. You guess first, study one example, then try one yourself.",
  },
  {
    icon: "gem",
    color: "#9fd5ea",
    title: "Practice that comes back",
    text: "Short drills return right when you are about to forget, so things stick without cramming.",
  },
  {
    icon: "heart",
    color: "#ff9e80",
    title: "Practice rounds that point forward",
    text: "You check your answers against key points, then see what to work on next, not just how you did.",
  },
  {
    icon: "flame",
    color: "#f08a24",
    title: "A pace you control",
    text: "Rest days that never break your streak, tea breaks mid-interview, and no leaderboards.",
  },
];

function Block({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className={SECTION}>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="font-pixel text-3xl font-bold text-ink sm:text-4xl">{title}</h2>
        <div className="flex flex-col gap-4 text-lg leading-relaxed text-ink">{children}</div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <>
      <Nav current="about" />
      <main>
        <section className="bg-sky px-5 py-12 sm:px-6 sm:py-16">
          <div className={`${INNER} grid items-center gap-8 lg:grid-cols-[1fr_auto]`}>
            <div className="flex max-w-2xl flex-col gap-4">
              <Eyebrow>About {APP_NAME}</Eyebrow>
              <h1 className="font-pixel text-4xl font-bold leading-[1.05] text-ink sm:text-6xl">
                AI interview practice that stays kind
              </h1>
              <p className="text-lg text-ink-soft sm:text-xl">
                {APP_NAME} started with one hard interview and one word. This is the story, and the
                reason it&apos;s free for now.
              </p>
            </div>
            <div className="mx-auto lg:mx-0">
              <PixelArtBobbin mood="thinking" size={200} priority />
            </div>
          </div>
        </section>

        <Block eyebrow="Where it started" title="One word: “Understood.”">
          <p>
            I sat <strong className="font-extrabold">an AI interview</strong> for a web developer job. The invite said I didn&apos;t need to
            prepare anything. The questions were hard anyway, and I did badly.
          </p>
          <p>
            When it ended, the only thing I got back was “Understood.” No score. No hint about what I
            missed. Nothing to learn from. I closed the laptop not knowing what to study next.
          </p>
        </Block>

        <div className="bg-cream-deep">
          <Block eyebrow="Why practice felt so hard" title="The prep was the problem, too">
            <p>
              Reading documentation for basics felt tedious. Practice problems wore me out, and the
              timed, LeetCode-style kind left me discouraged more than prepared.
            </p>
            <p>
              I tried studying with chat assistants. They helped a little, but nothing pulled me back
              the next day. I wanted something that felt more like a game and less like a test I was
              already failing.
            </p>
          </Block>
        </div>

        <section className={`${SECTION} bg-mint`}>
          <div className={`${INNER} flex flex-col gap-10`}>
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
              <Eyebrow>What I wanted instead</Eyebrow>
              <Title>Something built around how people actually learn</Title>
            </div>
            <ul className="grid gap-6 md:grid-cols-2">
              {WANTED.map((w) => (
                <li key={w.title} className="pixel-box flex gap-4 p-6">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center border-[3px] border-line bg-paper">
                    <PixelIcon name={w.icon} size={28} color={w.color} />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-pixel text-xl font-bold text-ink">{w.title}</h3>
                    <p className="text-ink-soft">{w.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Block eyebrow="Why it's free for now" title="I want to learn before I charge anyone">
          <p>
            I&apos;m building {APP_NAME} on my own, and I don&apos;t yet know what helps people most.
            I&apos;d rather find that out with real learners than guess, so there&apos;s no price for
            now.
          </p>
          <p>
            Lessons, drills and practice rounds cost almost nothing to run, so they&apos;re free.
            I&apos;d like to add <strong className="font-extrabold">an AI interviewer</strong> later. That would cost real money every time, so it
            would likely come with a daily limit while it&apos;s free.
          </p>
          <p>
            If {APP_NAME} ever has paid options, I want the free part to stay genuinely useful.
          </p>
        </Block>

        <div className="bg-lilac">
          <Block eyebrow="One line I won't cross" title="Practice, not shortcuts">
            <p>
              {APP_NAME} is for getting better before the interview. It won&apos;t help anyone hide AI
              use during a live interview, and it never will.
            </p>
          </Block>
        </div>

        <section className={`${SECTION} bg-teal-wash`}>
          <div className={`${INNER} flex flex-col items-center gap-6 text-center`}>
            <PixelArtBobbin mood="cheering" size={140} />
            <Title>Come practice with Bobbin</Title>
            <p className="max-w-xl text-lg text-ink-soft">
              Your first lesson takes about {FIRST_LESSON_MINUTES} minutes. No card, no pressure.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href="/login?mode=new" className="btn-primary">
                Start your quest for free
              </Link>
              <Link href="/" className="btn-secondary">
                Back to the tour
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
