import Link from "next/link";
import { APP_NAME, FIRST_LESSON_MINUTES } from "@/lib/config";
import { SEASONS, type Season } from "@/lib/season";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { PixelCloud, PixelIcon, type PixelIconName } from "./PixelIcon";

export const SECTION = "px-5 py-14 sm:px-6 sm:py-20";
export const INNER = "mx-auto w-full max-w-6xl";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-pixel text-sm font-bold uppercase tracking-wide text-teal-deep">{children}</p>;
}

export function Title({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`font-pixel text-3xl font-bold text-ink sm:text-5xl ${className}`}>{children}</h2>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <Title>{title}</Title>
      <p className="text-lg text-ink-soft">{sub}</p>
    </div>
  );
}

export function Nav({ current }: { current?: "about" }) {
  return (
    <header className="bg-cream">
      <div className={`${INNER} flex items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4`}>
        <Link href="/" className="flex items-center gap-2" aria-label={`${APP_NAME} home`}>
          <PixelArtBobbin mood="sparkle" outfit="winter" size={36} />
          <span className="font-pixel text-2xl font-bold text-ink sm:text-3xl">
            tuft<span className="text-teal">ly</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 font-semibold text-ink md:flex" aria-label="Sections">
          <Link href="/#how">How it works</Link>
          <Link href="/#bobbin">Meet Bobbin</Link>
          <Link href="/about" aria-current={current === "about" ? "page" : undefined} className={current === "about" ? "underline decoration-[3px] underline-offset-8" : ""}>
            About
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="font-pixel whitespace-nowrap px-1 py-2 font-bold text-ink underline sm:hidden">
            Log in
          </Link>
          <Link href="/login" className="btn-secondary hidden sm:inline-flex">
            Log in
          </Link>
          <Link href="/login?mode=new" className="btn-primary whitespace-nowrap !px-3 !py-2 !text-sm sm:!px-5 sm:!py-2.5 sm:!text-base">
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

/** The hero scene. Laid out from the ground up so Bobbin always stands on the grass. */
function Island() {
  return (
    <div
      className="relative mx-auto flex h-[330px] w-full max-w-[520px] flex-col items-center justify-end sm:h-[540px]"
      aria-hidden="true"
    >
      <div className="absolute left-0 top-3 sm:top-8">
        <PixelCloud size={96} />
      </div>
      <div className="absolute right-0 top-14 sm:right-2 sm:top-28">
        <PixelCloud size={64} />
      </div>
      <div className="absolute left-8 top-52 hidden sm:block"><PixelIcon name="star" size={36} color="#f2b93b" /></div>
      <div className="absolute right-4 top-4 sm:right-6 sm:top-8"><PixelIcon name="star" size={30} color="#f2b93b" /></div>
      <div className="absolute right-4 top-[190px] hidden sm:block"><PixelIcon name="gem" size={34} color="#9fd5ea" /></div>

      {/* The image has a little empty space under the feet, so pull it down onto the grass. */}
      <div className="relative z-10 -mb-[9%] [&_img]:h-[200px] [&_img]:w-[200px] sm:[&_img]:h-[300px] sm:[&_img]:w-[300px]">
        <PixelArtBobbin mood="sparkle" outfit="winter" size={300} priority />
      </div>

      <div className="relative w-[calc(100%-32px)] sm:w-[calc(100%-64px)]">
        <div className="absolute bottom-full left-1 sm:left-8">
          <div className="flex h-9 w-12 items-center justify-center border-[3px] border-line bg-paper sm:h-10 sm:w-14">
            <PixelIcon name="arrow" size={22} color="#2f7f78" />
          </div>
          <div className="mx-auto h-12 w-2.5 bg-[#c99a6b] sm:h-16" />
        </div>
        <div className="h-10 border-[3px] border-line bg-grass sm:h-12" />
      </div>
      <div className="h-16 w-[calc(100%-120px)] border-[3px] border-t-0 border-line bg-[#c99a6b] sm:h-24 sm:w-[calc(100%-160px)]" />
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-sky px-5 py-10 sm:px-6 sm:py-16">
      <div className={`${INNER} grid items-center gap-10 lg:grid-cols-2`}>
        <div className="flex flex-col items-start gap-6">
          <span className="pixel-chip">
            <PixelIcon name="star" size={18} color="#f2b93b" />
            Free practice, with tea breaks
          </span>
          <h1 className="font-pixel text-4xl font-bold leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
            Warm up for your next coding interview
          </h1>
          <p className="max-w-xl text-lg text-ink-soft sm:text-xl">
            {APP_NAME} is a friendly practice space. Take short lessons, play through game-like
            drills and rehearse interview questions with Bobbin, a pixel bird who keeps you
            company while you work out what to practice next.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link href="/login?mode=new" className="btn-primary">
              Start your quest for free
            </Link>
            <a href="#how" className="btn-secondary">
              See how it works
            </a>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-bold">
            <span className="pixel-chip bg-peach"><PixelIcon name="flame" size={16} color="#f08a24" /> Gentle streaks</span>
            <span className="pixel-chip bg-mint"><PixelIcon name="check" size={16} color="#2f7f78" /> No leaderboards</span>
          </div>
        </div>
        <Island />
      </div>
    </section>
  );
}

const STEPS: { icon: PixelIconName; bg: string; fg: string; title: string; text: string }[] = [
  {
    icon: "check",
    bg: "bg-teal",
    fg: "#fffdf4",
    title: "Learn a little",
    text: "Open a lesson, make a guess, study an example and try one yourself.",
  },
  {
    icon: "star",
    bg: "bg-butter",
    fg: "#f2b93b",
    title: "Practice often",
    text: "Quick drills bring each idea back right when you are about to forget it.",
  },
  {
    icon: "speech",
    bg: "bg-lilac-deep",
    fg: "#fffdf4",
    title: "Rehearse with Bobbin",
    text: "Answer interview questions in your own words, then check yourself against the key points.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className={`${SECTION} bg-cream`}>
      <div className={`${INNER} flex flex-col gap-12`}>
        <SectionHead
          eyebrow="How it works"
          title="Three steps to interview ready"
          sub="Short sessions that fit between everything else."
        />
        <ol className="grid gap-10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex flex-col items-center gap-5">
              <span className={`flex h-[76px] w-[76px] items-center justify-center border-[3px] border-line ${s.bg}`}>
                <PixelIcon name={s.icon} size={36} color={s.fg} />
              </span>
              <div className="pixel-box flex w-full flex-1 flex-col items-center gap-2 p-6 text-center">
                <span className="text-sm font-bold text-teal-deep">Step {i + 1}</span>
                <h3 className="font-pixel text-xl font-bold text-ink">{s.title}</h3>
                <p className="text-ink-soft">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const FEATURES: { icon: PixelIconName; color: string; title: string; text: string }[] = [
  { icon: "star", color: "#f2b93b", title: "Bite-size lessons", text: "A few minutes each. Guess first, study a worked example, then try it yourself." },
  { icon: "gem", color: "#9fd5ea", title: "Practice that sticks", text: "Questions come back on a schedule and mix across topics, so what you learn stays with you." },
  { icon: "heart", color: "#ff9e80", title: "Practice rounds with Bobbin", text: "Answer, compare with a strong answer, tick the key points you covered and see what to practice next." },
  { icon: "flame", color: "#f08a24", title: "Pick your pressure", text: "Start relaxed, then work up to a strict, timed round that feels like interview day." },
  { icon: "check", color: "#2f7f78", title: "Gentle streaks", text: "Rest days and a grace day keep your streak safe. There are no leaderboards." },
  { icon: "coin", color: "#f2b93b", title: "Seasonal outfits", text: "A scarf in winter, a flower crown in spring, a sun hat in summer and a beret in autumn." },
];

function Features() {
  return (
    <section className={`${SECTION} bg-mint`}>
      <div className={`${INNER} flex flex-col gap-12`}>
        <SectionHead
          eyebrow="What you get"
          title="Everything you need to feel ready"
          sub={`Small wins every day add up. Here is how ${APP_NAME} keeps practice friendly.`}
        />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="pixel-box flex flex-col gap-3 p-7">
              <span className="flex h-16 w-16 items-center justify-center border-[3px] border-line bg-paper">
                <PixelIcon name={f.icon} size={32} color={f.color} />
              </span>
              <h3 className="font-pixel text-xl font-bold text-ink">{f.title}</h3>
              <p className="text-ink-soft">{f.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const MOODS = [
  { mood: "sparkle", label: "Ready" },
  { mood: "thinking", label: "Thinking" },
  { mood: "cheering", label: "Cheering" },
  { mood: "sleepy", label: "Resting" },
] as const;

function MeetBobbin() {
  return (
    <section id="bobbin" className={`${SECTION} bg-butter`}>
      <div className={`${INNER} grid items-center gap-10 lg:grid-cols-2`}>
        <div className="flex flex-col gap-4">
          <Eyebrow>Meet Bobbin</Eyebrow>
          <Title>A pixel bird who practices with you</Title>
          <p className="max-w-lg text-lg text-ink">
            Bobbin cheers when you get it, thinks along when it is tricky and keeps you company on
            rest days. Eight expressions follow how your practice is going.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {MOODS.map((m) => (
            <li key={m.mood} className="pixel-box flex flex-col items-center gap-1 p-3">
              <PixelArtBobbin mood={m.mood} outfit="winter" size={104} />
              <span className="font-pixel text-sm font-semibold text-ink">{m.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const LEVELS = [
  { mood: "happy", bg: "bg-mint", name: "Relaxed", text: "Hints are on and there is no timer. Take all the time you need." },
  { mood: "sparkle", bg: "bg-peach", name: "Standard", text: "Hints are on, with a gentle timer for each question." },
  { mood: "determined", bg: "bg-lilac", name: "Interview day", text: "No hints and a shorter timer, so the real thing feels familiar." },
] as const;

function Pressure() {
  return (
    <section className={`${SECTION} bg-cream`}>
      <div className={`${INNER} flex flex-col gap-12`}>
        <SectionHead eyebrow="Your pace" title="Pick how it feels" sub="Turn the pressure up when you are ready." />
        <ul className="grid gap-6 md:grid-cols-3">
          {LEVELS.map((l) => (
            <li key={l.name} className={`pixel-box flex flex-col items-center gap-3 p-8 text-center ${l.bg}`}>
              <PixelArtBobbin mood={l.mood} outfit="winter" size={140} />
              <h3 className="font-pixel text-xl font-bold text-ink">{l.name}</h3>
              <p className="text-ink-soft">{l.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const OUTFIT_LABEL: Record<Season, string> = {
  winter: "Winter scarf",
  spring: "Spring flower crown",
  summer: "Summer sun hat",
  autumn: "Autumn beret",
};

function Seasons() {
  return (
    <section className={`${SECTION} bg-sky`}>
      <div className={`${INNER} flex flex-col gap-12`}>
        <SectionHead
          eyebrow="All year"
          title="Bobbin dresses for the season"
          sub="Open the app and see what Bobbin is wearing today."
        />
        <ul className="mx-auto grid grid-cols-2 gap-5 lg:grid-cols-4">
          {SEASONS.map((s) => (
            <li key={s} className="pixel-box flex flex-col items-center gap-2 p-4">
              <PixelArtBobbin mood="sparkle" outfit={s} size={150} />
              <span className="font-pixel text-sm font-semibold text-ink">{OUTFIT_LABEL[s]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCall() {
  return (
    <section id="free" className={`${SECTION} bg-teal-wash`}>
      <div className={`${INNER} flex flex-col items-center gap-8 sm:flex-row sm:justify-center`}>
        <PixelArtBobbin mood="cheering" outfit="winter" size={180} />
        <div className="flex max-w-xl flex-col items-start gap-4">
          <Title>Ready when you are</Title>
          <p className="text-lg text-ink-soft">
            Start free today. Your first lesson takes about {FIRST_LESSON_MINUTES} minutes.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/login?mode=new" className="btn-primary">
              Start your quest
            </Link>
            <a href="#how" className="btn-accent">
              Take the tour
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-cream px-6 py-8">
      <div className={`${INNER} flex flex-wrap items-center justify-between gap-4 text-sm text-ink-soft`}>
        <span className="font-pixel text-lg font-bold text-ink">
          tuft<span className="text-teal">ly</span>
        </span>
        <span>Made for people who get nervous before interviews.</span>
        <nav aria-label="Footer" className="flex gap-5 font-semibold text-ink">
          <Link href="/about">About</Link>
          <Link href="/login">Log in</Link>
        </nav>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <MeetBobbin />
        <Pressure />
        <Seasons />
        <FinalCall />
      </main>
      <Footer />
    </>
  );
}
