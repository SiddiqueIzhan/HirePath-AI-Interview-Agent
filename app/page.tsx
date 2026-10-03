"use client";

/** Interactive landing page sections and their animated product demos. */

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Caveat } from "next/font/google";
import {
  animate,
  motion,
  MotionConfig,
  useAnimationControls,
  useMotionValue,
  useScroll,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
} from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  ChartColumn,
  Check,
  FileText,
  Layers,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  MessageSquare,
  Search,
  Target,
  Upload,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";

/* ====================================================================== */
/* Static styles (tone tokens + helpers). No animations live here.         */
/* ====================================================================== */


/* ====================================================================== */
/* Fonts                                                                   */
/* ====================================================================== */

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
  display: "swap",
});

/* ====================================================================== */
/* Motion primitives                                                       */
/* ====================================================================== */

type Bezier = [number, number, number, number];
type Ease = "linear" | Bezier;

const EASE_OUT: Bezier = [0.2, 0.7, 0.2, 1];
const EASE_CUBIC: Bezier = [0.33, 1, 0.68, 1];
const EASE_STD: Bezier = [0.25, 0.1, 0.25, 1];

/** Entrance used by the hero: fade + rise on mount. */
const rise = (delay: number, duration = 0.9) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay, ease: EASE_STD },
});

/** Fades/slides its content in the first time it scrolls into view. */
type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  onReveal?: () => void;
};

function Reveal({ delay = 0, onReveal, children, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT }}
      onViewportEnter={onReveal}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Integer that tweens towards `value` (starts at `value`, animates on change). */
function AnimatedNumber({
  value,
  duration = 0.7,
  ease = "linear",
  suffix = "",
}: {
  value: number;
  duration?: number;
  ease?: Ease;
  suffix?: string;
}) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    const controls = animate(mv, value, { duration, ease });
    return () => controls.stop();
  }, [mv, value, duration, ease]);

  return <motion.span>{text}</motion.span>;
}

/** shadcn <Progress> whose value is tweened by framer-motion. */
function AnimatedProgress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const latest = useRef(value);

  useEffect(() => {
    const controls = animate(latest.current, value, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (v) => {
        latest.current = v;
        setShown(v);
      },
    });
    return () => controls.stop();
  }, [value]);

  return <Progress value={shown} className={className} />;
}

/** Hover lift for cards: the wrapper rises, an overlay border fades in. Children can use the "rest"/"hover" variants too. */
function Lift({
  accent = "var(--lp-deep)",
  className,
  children,
}: {
  accent?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={{ rest: { y: 0 }, hover: { y: -6 } }}
      transition={{ duration: 0.35 }}
      className={cn("relative h-full", className)}
    >
      {children}
      <motion.span
        aria-hidden
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.35 }}
        className="pointer-events-none absolute inset-0 rounded-[20px] border"
        style={{ borderColor: accent }}
      />
    </motion.div>
  );
}

/* ====================================================================== */
/* Small shared pieces                                                     */
/* ====================================================================== */

/* ---- Buttons: shadcn styling + framer-motion hover/tap/glow ---- */
type Kind = "primary" | "ghost" | "outline" | "glow";

const VARIANT = {
  primary: "default",
  ghost: "ghost",
  outline: "outline",
  glow: "outline",
} as const;

// Static look only. Hover colours are driven by framer-motion (see HOVER).
const KIND_CLASS: Record<Kind, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary",
  ghost: "text-[#c9cbce] hover:bg-transparent hover:text-[#c9cbce]",
  outline:
    "border-white/30 bg-transparent text-white shadow-none hover:bg-transparent hover:text-white dark:border-white/30 dark:bg-transparent dark:hover:bg-transparent",
  glow: "border-white/30 bg-black text-white hover:bg-black hover:text-white dark:border-white/30 dark:bg-black dark:hover:bg-black",
};

const GLOW_DIM =
  "0 18px 60px -8px rgba(43,227,154,.45), inset 0 -10px 24px -14px rgba(43,227,154,.7)";
const GLOW_BRIGHT =
  "0 22px 80px -4px rgba(43,227,154,.7), inset 0 -10px 24px -10px rgba(43,227,154,.9)";

const HOVER = {
  primary: {
    backgroundColor: "#55efb0",
    boxShadow: "0 0 28px rgba(43,227,154,.5)",
  },
  ghost: { color: "#ffffff" },
  outline: { borderColor: "#2be39a" },
  glow: { borderColor: "#2be39a" },
};

function btnMotion(kind: Kind) {
  return {
    whileHover: HOVER[kind],
    whileTap: { scale: 0.97 },
    transition:
      kind === "glow"
        ? {
            duration: 0.2,
            boxShadow: {
              duration: 3.4,
              repeat: Infinity,
              ease: "easeInOut" as const,
            },
          }
        : { duration: 0.2 },
    ...(kind === "glow"
      ? { animate: { boxShadow: [GLOW_DIM, GLOW_BRIGHT, GLOW_DIM] } }
      : {}),
  };
}

function lpBtn(kind: Kind, large = false) {
  return cn(
    "h-10 rounded-[10px] px-[18px] text-sm font-medium transition-none",
    KIND_CLASS[kind],
    large && "h-[54px] rounded-xl px-[30px] text-[17px]",
  );
}

/** Anchor styled like a shadcn Button (for in-page links). */
function LinkButton({
  kind,
  large,
  className,
  ...props
}: HTMLMotionProps<"a"> & { kind: Kind; large?: boolean }) {
  return (
    <motion.a
      className={cn(
        buttonVariants({ variant: VARIANT[kind] }),
        lpBtn(kind, large),
        className,
      )}
      {...btnMotion(kind)}
      {...props}
    />
  );
}

/** The real shadcn <Button>, made motion-aware (needs ref pass-through, default in React 19). */
const MButton = motion.create(Button);
const MTextarea = motion.create(Textarea);
const MTableRow = motion.create(TableRow);

function Chip({
  tone = "default",
  className,
  children,
}: {
  tone?: "default" | "ok" | "warn";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "lp-chip",
        tone === "ok" && "lp-chip-ok",
        tone === "warn" && "lp-chip-warn",
        className,
      )}
    >
      {children}
    </Badge>
  );
}

function Meter({
  value,
  large,
  warn,
  className,
}: {
  value: number;
  large?: boolean;
  warn?: boolean;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className={cn(
        "lp-meter",
        large && "lp-meter-lg",
        warn && "lp-meter-warn",
        className,
      )}
    >
      <motion.i
        initial={false}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.4, ease: EASE_OUT }}
      />
    </div>
  );
}

const listVariants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.3, staggerChildren: 0.22 } },
};
const listItemVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

function Stagger({
  items,
  className,
}: {
  items: { label: string; warn?: boolean }[];
  className?: string;
}) {
  return (
    <motion.ul
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={listVariants}
      className={cn("m-0 grid list-none gap-3.5 p-0", className)}
    >
      {items.map((item) => (
        <motion.li
          key={item.label}
          variants={listItemVariants}
          className="flex items-center gap-3 text-base"
        >
          {item.warn ? (
            <span className="lp-tri">△</span>
          ) : (
            <span className="lp-tick">
              <Check className="size-[13px]" strokeWidth={3} />
            </span>
          )}
          {item.label}
        </motion.li>
      ))}
    </motion.ul>
  );
}

/* ---- Scroll-scrubbed paragraph (framer-motion useScroll) ---- */
function ScrubWord({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(
    progress,
    [index / total, (index + 1) / total],
    [0.2, 1],
  );
  return <motion.span style={{ opacity }}>{word}</motion.span>;
}

function ScrubText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = useMemo(
    () => children.split(/\s+/).filter(Boolean),
    [children],
  );
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.47"],
  });

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <ScrubWord
            word={word}
            index={i}
            total={words.length}
            progress={scrollYProgress}
          />
        </Fragment>
      ))}
    </p>
  );
}

/* ---- Section layout ---- */
function Section({
  tone = "light",
  joined = false,
  id,
  className,
  children,
}: {
  tone?: "light" | "dark";
  joined?: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-tone={tone}
      className={cn(
        "relative bg-background text-foreground",
        joined
          ? "-mt-[100px] rounded-none px-6 pb-[130px] pt-10 max-[900px]:px-[18px]"
          : "-mt-12 rounded-t-[48px] px-6 pb-[130px] pt-[120px] max-[900px]:-mt-[30px] max-[900px]:rounded-t-[30px] max-[900px]:px-[18px]",
        className,
      )}
    >
      <div className="mx-auto max-w-[1120px]">{children}</div>
    </section>
  );
}

function SectionTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <h2
        className={cn(
          "text-center text-[clamp(32px,5vw,58px)] font-medium leading-[1.05] tracking-[-.045em]",
          className,
        )}
      >
        {children}
      </h2>
    </Reveal>
  );
}

/* ====================================================================== */
/* Navbar                                                                  */
/* ====================================================================== */

/* ====================================================================== */
/* Hero                                                                    */
/* ====================================================================== */

type HeroWord = { text: string; delay: number; accent?: boolean };

const LINE_1: HeroWord[] = [
  { text: "Turn", delay: 0.1 },
  { text: "your", delay: 0.2 },
  { text: "resume", delay: 0.3 },
  { text: "into", delay: 0.4 },
];
const LINE_2: HeroWord[] = [
  { text: "a", delay: 0.55 },
  { text: "smarter", delay: 0.65, accent: true },
  { text: "job", delay: 0.8 },
  { text: "search.", delay: 0.9 },
];

const wordMotion = (delay: number) => ({
  initial: { opacity: 0, y: "0.35em", filter: "blur(14px)" },
  animate: { opacity: 1, y: "0em", filter: "blur(0px)" },
  transition: { duration: 1, delay, ease: EASE_OUT },
});

function HeroWords({ words }: { words: HeroWord[] }) {
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={word.text}>
          {i > 0 && " "}
          <motion.span
            className={cn("inline-block", word.accent && "text-primary")}
            {...wordMotion(word.delay)}
          >
            {word.text}
          </motion.span>
        </Fragment>
      ))}
    </>
  );
}

function Stat({
  value,
  suffix = "",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  return (
    <div className="rounded-[14px] border border-white/[.09] bg-[#17191c] px-4 py-3.5 max-[900px]:p-3">
      <b className="block text-[28px] font-medium tracking-[-.04em] max-[900px]:text-[22px]">
        <AnimatedNumber
          value={value}
          suffix={suffix}
          duration={1.5}
          ease={EASE_CUBIC}
        />
      </b>
      <span className="text-[12.5px] text-muted-foreground">{label}</span>
    </div>
  );
}

function HeroPreview() {
  const [live, setLive] = useState(false);

  // counters + meter start once the preview has faded in
  useEffect(() => {
    const t = setTimeout(() => setLive(true), 2100);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="relative mx-auto mt-[70px] max-w-[760px] after:absolute after:inset-x-[10%] after:-bottom-[50px] after:z-0 after:h-[120px] after:bg-[radial-gradient(closest-side,rgba(43,227,154,.4),transparent)] after:blur-[30px] after:content-['']"
      {...rise(1.7, 1.1)}
    >
      <div
        aria-hidden
        className="lp-script absolute -right-[150px] top-10 z-[2] flex -rotate-[10deg] flex-col items-start text-[30px] text-white max-[1100px]:hidden"
      >
        your AI co-pilot
        <svg
          className="mt-1 w-[70px]"
          viewBox="0 0 70 30"
          fill="none"
          stroke="#2be39a"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M66 4C50 4 30 10 8 24M8 24l10-1M8 24l3-10" />
        </svg>
      </div>

      <motion.div
        className="relative z-[1]"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <Card
          aria-label="Product dashboard preview"
          className="gap-0 rounded-3xl border-white/10 bg-[linear-gradient(180deg,#121518,#0a0c0e)] px-[22px] pb-6 pt-5 text-left shadow-[0_40px_90px_-30px_rgba(43,227,154,.25)]"
        >
          <div className="mb-[18px] flex gap-1.5" aria-hidden>
            <i className="size-[9px] rounded-full bg-[#ff6058]" />
            <i className="size-[9px] rounded-full bg-[#ffbd2e]" />
            <i className="size-[9px] rounded-full bg-[#27c93f]" />
          </div>

          <h4 className="text-[22px] font-medium tracking-[-.03em]">
            Good morning 👋
          </h4>

          <div className="mb-[22px] mt-[18px] grid grid-cols-3 gap-3 max-[900px]:gap-2">
            <Stat value={live ? 42 : 0} label="Jobs" />
            <Stat value={live ? 78 : 0} suffix="%" label="Match" />
            <Stat value={live ? 6 : 0} label="Applied" />
          </div>

          <div className="mb-2.5 text-[13px] text-muted-foreground">
            Recommended Jobs
          </div>

          <div className="rounded-2xl border border-white/[.09] bg-[#17191c] px-[18px] py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <strong className="block text-[17px] font-medium">
                  Frontend Developer
                </strong>
                <small className="text-[13px] text-muted-foreground">
                  Swiggy
                </small>
              </div>
              <span className="whitespace-nowrap text-sm font-semibold text-primary">
                87% Match
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-[7px]">
              <Chip tone="ok">React</Chip>
              <Chip tone="ok">Next</Chip>
              <Chip tone="ok">TypeScript</Chip>
            </div>
            <Meter value={live ? 87 : 0} className="mt-3.5" />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-5 pt-24 text-center before:pointer-events-none before:absolute before:left-1/2 before:top-[30%] before:h-[560px] before:w-[1000px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-[radial-gradient(closest-side,rgba(43,227,154,.15),transparent_70%)] before:content-['']">
      <motion.span className="inline-block" {...rise(0.05, 0.8)}>
        <Badge
          variant="outline"
          className="h-[26px] gap-[7px] rounded-full border-white/[.09] bg-white/[.06] px-[11px] text-[12.5px] font-normal text-[#d7d9dc]"
        >
          <motion.i
            className="lp-dot"
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          AI-powered job search
        </Badge>
      </motion.span>

      <h1
        aria-label="Turn your resume into a smarter job search."
        className="relative mx-auto mt-7 max-w-[1000px] text-[clamp(44px,8.4vw,104px)] font-medium leading-[.99] tracking-[-.05em]"
      >
        <span aria-hidden className="block text-[#55565a]">
          <HeroWords words={LINE_1} />
        </span>
        <span aria-hidden className="block text-[#e9eaeb]">
          <HeroWords words={LINE_2} />
          <motion.span className="inline-block" {...wordMotion(1.05)}>
            <motion.svg
              className="lp-spark"
              viewBox="0 0 48 48"
              animate={{ rotate: 360, opacity: [1, 0.65, 1] }}
              transition={{
                rotate: { duration: 7, repeat: Infinity, ease: "linear" },
                opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <path
                d="M24 2c1.5 11 5 18 22 22-17 4-20.5 11-22 22-1.5-11-5-18-22-22 17-4 20.5-11 22-22z"
                fill="#2be39a"
              />
            </motion.svg>
          </motion.span>
        </span>
      </h1>

      <motion.p
        className="relative mx-auto mt-[30px] max-w-[580px] text-[clamp(16px,1.7vw,20px)] text-[#85888c]"
        {...rise(1.2)}
      >
        Analyze your resume, discover relevant jobs, prepare for interviews and
        track your progress — all in one place.
      </motion.p>

      <motion.div
        className="relative mt-[34px] flex flex-wrap justify-center gap-3"
        {...rise(1.4)}
      >
        <LinkButton kind="glow" large href="#final">
          Start For Free
        </LinkButton>
        <LinkButton kind="outline" large href="#how">
          See How It Works
        </LinkButton>
      </motion.div>

      <HeroPreview />
    </section>
  );
}

/* ====================================================================== */
/* Match result                                                            */
/* ====================================================================== */

const RING_LENGTH = 327; // 2π × r(52)
const MATCH_SCORE = 87;

const MATCH_SKILLS = [
  { label: "React" },
  { label: "Next.js" },
  { label: "TypeScript" },
  { label: "Testing", warn: true },
  { label: "AWS", warn: true },
];

function MatchResult() {
  const [on, setOn] = useState(false);

  return (
    <Reveal onReveal={() => setOn(true)} className="mx-auto max-w-[360px]">
      <Card className="gap-0 rounded-[20px] border-[rgba(43,227,154,.35)] p-[30px] text-center shadow-[0_30px_80px_-40px_rgba(43,227,154,.5)]">
        <div className="relative mx-auto mb-3 size-[150px]">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="rgba(255,255,255,.1)"
              strokeWidth="9"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#2be39a"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              initial={{ strokeDashoffset: RING_LENGTH }}
              animate={{
                strokeDashoffset: on
                  ? RING_LENGTH * (1 - MATCH_SCORE / 100)
                  : RING_LENGTH,
              }}
              transition={{ duration: 1.6, ease: EASE_OUT }}
              style={{ filter: "drop-shadow(0 0 8px rgba(43,227,154,.7))" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-[34px] font-medium tracking-[-.04em]">
            <div className="text-center">
              <AnimatedNumber
                value={on ? MATCH_SCORE : 0}
                suffix="%"
                duration={1.6}
                ease={EASE_CUBIC}
              />
              <small className="-mt-1 block text-center text-[13px] font-normal tracking-normal text-muted-foreground">
                MATCH
              </small>
            </div>
          </div>
        </div>

        <Stagger items={MATCH_SKILLS} className="mt-4 text-left" />
      </Card>
    </Reveal>
  );
}

/* ====================================================================== */
/* Interview demo                                                          */
/* ====================================================================== */

const QUESTIONS = [
  {
    q: "Explain the difference between useMemo and useCallback.",
    k: [
      "memo",
      "callback",
      "function",
      "value",
      "reference",
      "dependenc",
      "re-render",
      "rerender",
      "cache",
      "memoiz",
    ],
  },
  {
    q: "How does React reconcile the virtual DOM, and why do keys matter?",
    k: [
      "virtual",
      "diff",
      "key",
      "reconcil",
      "render",
      "list",
      "identity",
      "fiber",
    ],
  },
  {
    q: "What is the difference between SSR, SSG and CSR in Next.js?",
    k: [
      "server",
      "static",
      "client",
      "build",
      "request",
      "hydrat",
      "seo",
      "cache",
      "revalid",
    ],
  },
  {
    q: "How would you debounce a search input in React?",
    k: [
      "debounce",
      "timeout",
      "settimeout",
      "cleanup",
      "useeffect",
      "delay",
      "cancel",
      "api",
    ],
  },
];

const DEFAULT_PLACEHOLDER = "Type your answer...";

type InterviewResult = {
  overall: number;
  comm: number;
  tech: number;
  rel: number;
  strengths: string[];
  improve: string[];
  note: string;
};

const SAMPLE: InterviewResult = {
  overall: 82,
  comm: 85,
  tech: 78,
  rel: 88,
  strengths: ["Clear explanation", "Good examples"],
  improve: ["Deeper technical detail"],
  note: "Sample results. Submit an answer to see a demo score, calculated in your browser.",
};

/** Demo scoring: keywords + length, entirely client-side. */
function scoreAnswer(text: string, keywords: string[]): InterviewResult {
  const low = text.toLowerCase();
  const words = text.split(/\s+/).length;
  const hits = keywords.filter((k) => low.includes(k)).length;

  const comm = Math.min(95, Math.round(52 + Math.min(words, 60) * 0.65));
  const tech = Math.min(
    95,
    Math.round(42 + hits * 11 + Math.min(words, 50) * 0.3),
  );
  const rel = Math.min(
    96,
    Math.round(50 + hits * 9 + Math.min(words, 40) * 0.4),
  );

  const strengths = [
    comm >= 75 ? "Clear explanation" : "Answered the question directly",
  ];
  if (hits >= 2) strengths.push("Good use of terminology");
  else if (words >= 25) strengths.push("Good level of detail");

  const improve = [
    tech < 75 ? "Deeper technical detail" : "Add a concrete example",
  ];
  if (words < 25) improve.push("Elaborate a little more");

  return {
    overall: Math.round((comm + tech + rel) / 3),
    comm,
    tech,
    rel,
    strengths,
    improve,
    note: "Demo score, calculated in your browser from keywords and length.",
  };
}

function MetricRow({
  label,
  value,
  shown,
}: {
  label: string;
  value: number;
  shown: boolean;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr_44px] items-center gap-3 text-sm max-[900px]:grid-cols-[100px_1fr_64px] max-[520px]:grid-cols-[90px_1fr_40px]">
      <span>{label}</span>
      <Meter value={shown ? value : 0} />
      <b className="text-right font-medium">
        <AnimatedNumber value={value} suffix="%" />
      </b>
    </div>
  );
}

function InterviewDemo() {
  const [qi, setQi] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [text, setText] = useState("");
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACEHOLDER);
  const [result, setResult] = useState<InterviewResult>(SAMPLE);
  const [metersShown, setMetersShown] = useState(false);
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const shake = useAnimationControls();

  function handleSubmit() {
    if (answered) {
      setQi((i) => (i + 1) % QUESTIONS.length);
      setAnswered(false);
      setText("");
      setPlaceholder(DEFAULT_PLACEHOLDER);
      answerRef.current?.focus();
      return;
    }

    const trimmed = text.trim();
    if (trimmed.length < 10) {
      shake.start({ x: [0, -6, 0, 6, 0], transition: { duration: 0.4 } });
      setPlaceholder("Write at least a sentence or two to get feedback...");
      return;
    }

    setResult(scoreAnswer(trimmed, QUESTIONS[qi].k));
    setAnswered(true);
  }

  const questionNo = qi + 3;

  return (
    <div className="mt-[60px] grid grid-cols-[1.25fr_1fr] items-stretch gap-[22px] max-[900px]:grid-cols-1">
      {/* ---- AI interviewer (always dark) ---- */}
      <Reveal className="h-full">
        <Card
          data-tone="dark"
          className="h-full gap-4 rounded-[22px] border-white/[.08] bg-[#0b0d0f] p-7 text-white"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs tracking-[.14em] text-primary">
              AI INTERVIEWER
            </span>
            <span className="text-[13px] text-[#9a9ea3]">
              Question {questionNo} / 10
            </span>
          </div>

          <div className="text-xl tracking-[-.03em]">
            Frontend Developer Interview
          </div>

          <AnimatedProgress
            value={questionNo * 10}
            className="h-1 bg-white/10 *:data-[slot=progress-indicator]:transition-none"
          />

          <div className="min-h-[90px] text-[clamp(19px,2.2vw,24px)] leading-[1.25] tracking-[-.025em]">
            “{QUESTIONS[qi].q}”
          </div>

          <MTextarea
            ref={answerRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            aria-label="Your answer"
            animate={shake}
            whileFocus={{
              borderColor: "#2be39a",
              boxShadow: "0 0 0 3px rgba(43,227,154,.18)",
            }}
            transition={{ duration: 0.2 }}
            className="field-sizing-fixed min-h-[110px] resize-y rounded-xl border-white/[.12] bg-[#16181b] p-3.5 text-[15px] text-white transition-none placeholder:text-[#6f7479] focus-visible:ring-0 dark:bg-[#16181b]"
          />

          <div className="text-center">
            <MButton
              className={lpBtn("primary")}
              {...btnMotion("primary")}
              onClick={handleSubmit}
            >
              {answered ? "Next question" : "Submit Answer"}
            </MButton>
          </div>
        </Card>
      </Reveal>

      {/* ---- Performance ---- */}
      <Reveal
        delay={0.15}
        className="h-full"
        onReveal={() => setMetersShown(true)}
      >
        <Card className="h-full gap-3.5 rounded-[20px] p-7">
          <div className="lp-g text-xs tracking-[.14em]">YOUR PERFORMANCE</div>

          <div className="flex items-baseline justify-between text-lg">
            <span>Overall</span>
            <b className="lp-g text-[44px] font-medium tracking-[-.05em]">
              <AnimatedNumber value={result.overall} suffix="%" />
            </b>
          </div>

          <MetricRow
            label="Communication"
            value={result.comm}
            shown={metersShown}
          />
          <MetricRow
            label="Technical"
            value={result.tech}
            shown={metersShown}
          />
          <MetricRow label="Relevance" value={result.rel} shown={metersShown} />

          <h5 className="mt-1.5 text-[13px] font-medium tracking-[.05em] text-muted-foreground">
            Strengths:
          </h5>
          <ul className="m-0 grid list-none gap-[7px] p-0 text-[14.5px]">
            {result.strengths.map((s) => (
              <li key={s}>
                <Chip tone="ok">✓</Chip> {s}
              </li>
            ))}
          </ul>

          <h5 className="mt-1.5 text-[13px] font-medium tracking-[.05em] text-muted-foreground">
            Improve:
          </h5>
          <ul className="m-0 grid list-none gap-[7px] p-0 text-[14.5px]">
            {result.improve.map((s) => (
              <li key={s}>
                <Chip tone="warn">△</Chip> {s}
              </li>
            ))}
          </ul>

          <div className="mt-auto text-xs text-muted-foreground">
            {result.note}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}

/* ====================================================================== */
/* Skills card                                                             */
/* ====================================================================== */

const SKILLS = [
  { name: "React", value: 95, level: "Strong" },
  { name: "TypeScript", value: 88, level: "Strong" },
  { name: "Next.js", value: 80, level: "Good" },
  { name: "Testing", value: 52, level: "Improve", improve: true },
  { name: "System Design", value: 38, level: "Improve", improve: true },
];

const PLAN = [
  {
    title: "Week 1: Testing",
    body: "Write unit tests for three of your own components with React Testing Library.",
  },
  {
    title: "Week 2: System Design",
    body: "Sketch the front-end design for a search autocomplete and a news feed.",
  },
  {
    title: "Week 3: Mock interviews",
    body: "Run role-specific mock interviews and review the feedback after each one.",
  },
];

const planVariants = {
  hidden: {},
  show: { transition: { delayChildren: 0.1, staggerChildren: 0.2 } },
};
const planItemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

type PlanStatus = "idle" | "loading" | "done";

function SkillsCard() {
  const [shown, setShown] = useState(false);
  const [status, setStatus] = useState<PlanStatus>("idle");
  const planRef = useRef<HTMLDivElement>(null);

  // fake "generation" delay
  useEffect(() => {
    if (status !== "loading") return;
    const t = setTimeout(() => setStatus("done"), 900);
    return () => clearTimeout(t);
  }, [status]);

  // bring the plan into view once it renders
  useEffect(() => {
    if (status === "done") {
      planRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [status]);

  return (
    <Reveal
      onReveal={() => setShown(true)}
      className="mx-auto mt-[60px] max-w-[860px]"
    >
      <Card className="gap-0 rounded-[20px] p-[30px]">
        <div className="mb-[22px] text-xs tracking-[.14em] text-primary">
          YOUR SKILL PROFILE
        </div>

        {SKILLS.map((skill) => (
          <div
            key={skill.name}
            className="mb-[18px] grid grid-cols-[130px_1fr_80px] items-center gap-3.5 text-[15px] max-[900px]:grid-cols-[100px_1fr_64px]"
          >
            <span>{skill.name}</span>
            <Meter large warn={skill.improve} value={shown ? skill.value : 0} />
            <span
              className={cn(
                "text-right text-[13px] text-primary",
                skill.improve && "text-[#ffbd2e]",
              )}
            >
              {skill.level}
            </span>
          </div>
        ))}

        <div className="mt-7 text-center">
          <MButton
            className={lpBtn("primary", true)}
            {...btnMotion("primary")}
            disabled={status === "loading"}
            onClick={() => status === "idle" && setStatus("loading")}
          >
            {status === "loading" && (
              <motion.span
                className="inline-flex"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              >
                <LoaderCircle className="size-[18px]" />
              </motion.span>
            )}
            {status === "idle" && "Generate My Preparation Plan"}
            {status === "loading" && "Building your plan..."}
            {status === "done" && "Plan generated"}
          </MButton>
        </div>

        <div aria-live="polite">
          {status === "done" && (
            <motion.div
              ref={planRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mt-[26px] border-t border-border pt-6"
            >
              <h4 className="mb-3.5 text-lg font-medium">
                Your 3-week preparation plan
              </h4>
              <motion.ol
                className="lp-plan m-0 grid list-none gap-3 p-0"
                variants={planVariants}
                initial="hidden"
                animate="show"
              >
                {PLAN.map((step) => (
                  <motion.li key={step.title} variants={planItemVariants}>
                    <div>
                      <b className="block text-base font-medium">
                        {step.title}
                      </b>
                      <span className="text-sm text-muted-foreground">
                        {step.body}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </motion.ol>
            </motion.div>
          )}
        </div>
      </Card>
    </Reveal>
  );
}

/* ====================================================================== */
/* Application tracker                                                     */
/* ====================================================================== */

type AppStatus = "Applied" | "Interview" | "Offer" | "Rejected" | "Saved";

const FILTERS = [
  "All",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Saved",
] as const;
type Filter = (typeof FILTERS)[number];

const ROWS: {
  company: string;
  role: string;
  status: AppStatus;
  date: string;
}[] = [
  {
    company: "Swiggy",
    role: "Frontend Developer",
    status: "Interview",
    date: "Sep 28",
  },
  { company: "Razorpay", role: "SDE-1", status: "Applied", date: "Sep 25" },
  {
    company: "Zomato",
    role: "Frontend Engineer",
    status: "Saved",
    date: "Sep 22",
  },
  { company: "Cred", role: "UI Engineer", status: "Offer", date: "Sep 18" },
  {
    company: "Flipkart",
    role: "SDE-1 Frontend",
    status: "Rejected",
    date: "Sep 12",
  },
];

function ApplicationTracker() {
  const [filter, setFilter] = useState<Filter>("All");

  const visible =
    filter === "All" ? ROWS : ROWS.filter((r) => r.status === filter);
  const count = (f: Filter) =>
    f === "All" ? ROWS.length : ROWS.filter((r) => r.status === f).length;

  return (
    <>
      <Reveal className="mt-11 flex justify-center">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="h-auto max-w-full gap-1 overflow-x-auto rounded-xl bg-[var(--tabs-bg)] p-[5px]">
            {FILTERS.map((f) => (
              <TabsTrigger
                key={f}
                value={f}
                className="relative flex-none rounded-lg border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition-none data-[state=active]:bg-transparent data-[state=active]:text-primary-foreground data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent aria-selected:bg-transparent! aria-selected:text-primary-foreground! aria-selected:shadow-none!"
              >
                {filter === f && (
                  <motion.span
                    layoutId="lp-tab-pill"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    className="absolute inset-0 rounded-lg bg-primary"
                  />
                )}
                <span className="relative z-10">
                  {f}
                  <span className="ml-1.5 text-xs opacity-70">{count(f)}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Reveal>

      <Reveal className="mt-[26px]">
        <Card className="gap-0 overflow-x-auto rounded-[20px] px-2.5 py-1.5">
          <Table className="min-w-[560px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {["Company", "Role", "Status", "Date"].map((h) => (
                  <TableHead
                    key={h}
                    className="h-auto px-4 pb-3 pt-4 text-[13px] font-medium text-muted-foreground"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length ? (
                visible.map((row, i) => (
                  <MTableRow
                    // key includes the filter so the entrance replays on every tab change
                    key={`${filter}-${row.company}`}
                    className="transition-none hover:bg-transparent"
                    initial={{
                      opacity: 0,
                      y: 16,
                      backgroundColor: "rgba(43,227,154,0)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      backgroundColor: "rgba(43,227,154,0)",
                      transition: { duration: 0.5, delay: i * 0.07 },
                    }}
                    whileHover={{ backgroundColor: "rgba(43,227,154,.07)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <TableCell className="px-4 py-[17px] text-[15.5px] font-medium">
                      {row.company}
                    </TableCell>
                    <TableCell className="px-4 py-[17px] text-[15.5px]">
                      {row.role}
                    </TableCell>
                    <TableCell className="px-4 py-[17px] text-[15.5px]">
                      <span className={`lp-st lp-st-${row.status}`}>
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-[17px] text-[15.5px]">
                      {row.date}
                    </TableCell>
                  </MTableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-4 py-[17px] text-center text-muted-foreground"
                  >
                    Nothing here yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </Reveal>

      <p className="mt-3.5 text-center text-[12.5px] text-muted-foreground">
        Sample data for illustration.
      </p>
    </>
  );
}

/* ====================================================================== */
/* Footer                                                                  */
/* ====================================================================== */

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how" },
      { label: "Pricing", href: "#final" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#top" },
      { label: "GitHub", href: "#top" },
      { label: "Blog", href: "#top" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#top" },
      { label: "Contact", href: "#top" },
      { label: "Privacy", href: "#top" },
    ],
  },
];

function Footer() {
  return (
    <footer
      data-tone="dark"
      className="relative -mt-12 rounded-t-[48px] bg-black px-7 pb-[calc(34px+env(safe-area-inset-bottom,0px))] pt-[70px] max-[900px]:-mt-[30px] max-[900px]:rounded-t-[30px] max-[900px]:px-[18px]"
    >
      <div className="mx-auto grid max-w-[1120px] grid-cols-[1.4fr_repeat(3,1fr)] gap-10 max-[900px]:grid-cols-2">
        <div>
          <Logo />
          <p className="mt-3 max-w-[280px] text-[15px] text-muted-foreground">
            AI-powered job search and interview preparation.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h5 className="mb-3.5 text-sm font-medium text-white">
              {col.title}
            </h5>
            <ul className="m-0 grid list-none gap-2.5 p-0">
              {col.links.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    className="text-[15px] text-muted-foreground"
                    whileHover={{ color: "#2be39a" }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-[50px] flex max-w-[1120px] flex-wrap justify-between gap-4 border-t border-white/[.08] pt-6 text-sm text-muted-foreground">
        <span>© 2026 AI Job Agent</span>
        <nav className="flex gap-5">
          {["GitHub", "LinkedIn"].map((label) => (
            <motion.a
              key={label}
              href="#top"
              whileHover={{ color: "#ffffff" }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

/* ====================================================================== */
/* Page content                                                            */
/* ====================================================================== */

const STRIP = [
  "Resume Intelligence",
  "Smart Matching",
  "AI Interviews",
  "Personalized Prep",
  "Application Tracking",
];

const PROBLEMS = [
  {
    title: "Too many irrelevant jobs",
    body: "Endless listings that never match your skills or experience.",
  },
  {
    title: "Generic interview preparation",
    body: "Question lists that ignore the role you're actually going for.",
  },
  {
    title: "Don't know what skills to improve",
    body: "No clear picture of the gaps standing between you and the offer.",
  },
];

const FEATURES = [
  {
    icon: FileText,
    title: "Resume Intelligence",
    body: "Understand your skills and experience.",
  },
  {
    icon: Target,
    title: "Smart Job Matching",
    body: "Find jobs based on your actual profile.",
  },
  {
    icon: Bot,
    title: "AI Interview Practice",
    body: "Practice realistic, role-specific interviews.",
  },
  {
    icon: Layers,
    title: "Personalized Preparation",
    body: "Identify skill gaps and create a plan.",
  },
  {
    icon: ChartColumn,
    title: "Application Tracker",
    body: "Track applications and interviews.",
  },
  {
    icon: Lightbulb,
    title: "Career Insights",
    body: "Understand why a job matches you.",
  },
];

const STEPS = [
  {
    icon: Upload,
    title: "Upload Resume",
    body: "AI understands your profile.",
  },
  {
    icon: Search,
    title: "Discover Jobs",
    body: "Find relevant opportunities.",
  },
  {
    icon: MessageSquare,
    title: "Practice Interview",
    body: "Practice with an AI interviewer.",
  },
  {
    icon: ListChecks,
    title: "Track Progress",
    body: "Track your applications.",
  },
];

const RESUME_CHECKS = [
  { label: "Skills extracted" },
  { label: "Experience analyzed" },
  { label: "Projects identified" },
  { label: "Strengths discovered" },
];

// TODO: placeholder cards. Replace with real testimonials once you have actual users.
const TESTIMONIALS = [1, 2, 3].map((n) => ({
  id: n,
  quote: "Testimonial",
  name: "User Name",
}));

function ProfilePanel({
  label,
  title,
  lines,
  footnote,
}: {
  label: string;
  title: string;
  lines: string[];
  footnote: string;
}) {
  return (
    <Card className="gap-0 rounded-[20px] px-7 py-[26px] shadow-none">
      <div className="mb-3.5 text-xs tracking-[.14em] text-primary">
        {label}
      </div>
      <div className="mb-3 text-[22px] font-medium tracking-[-.03em]">
        {title}
      </div>
      <div className="flex flex-col gap-1.5 text-lg tracking-[-.02em]">
        {lines.map((l) => (
          <span key={l}>{l}</span>
        ))}
        <span className="mt-2 text-base text-muted-foreground">{footnote}</span>
      </div>
    </Card>
  );
}

/* ====================================================================== */
/* Page                                                                    */
/* ====================================================================== */

export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div
        data-tone="dark"
        className={cn(caveat.variable, "lp-root")}
      >
        {/* <Navbar /> */}

        <main id="top">
          <Hero />

          {/* ============ TRUST / VALUE STRIP ============ */}
          <section
            className="px-6 pb-[110px] pt-14 text-center"
            aria-label="What you get"
          >
            <Reveal className="mx-auto flex max-w-[960px] flex-wrap justify-center gap-x-[38px] gap-y-3.5 text-base text-[#9a9ea3] max-[520px]:gap-x-5 max-[520px]:text-sm">
              {STRIP.map((item) => (
                <span
                  key={item}
                  className="relative before:absolute before:-left-[22px] before:text-primary before:content-['•'] first:before:hidden max-[520px]:before:-left-3.5"
                >
                  {item}
                </span>
              ))}
            </Reveal>
          </section>

          {/* ============ PROBLEM ============ */}
          <Section tone="light">
            <SectionTitle>
              Job searching shouldn&apos;t feel like{" "}
              <span className="lp-g">guesswork.</span>
            </SectionTitle>

            <div className="mt-16 grid grid-cols-3 gap-[22px] max-[900px]:grid-cols-1">
              {PROBLEMS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.12} className="h-full">
                  <Lift>
                    <Card className="h-full min-h-[210px] gap-3.5 rounded-[20px] p-[30px] shadow-none">
                      <div className="grid size-10 place-items-center rounded-xl bg-[rgba(255,96,88,.12)] text-[#e5483f]">
                        <X className="size-6" strokeWidth={1.8} />
                      </div>
                      <h3 className="text-2xl font-medium leading-[1.15] tracking-[-.03em]">
                        {p.title}
                      </h3>
                      <p className="mt-auto text-[15px] text-muted-foreground">
                        {p.body}
                      </p>
                    </Card>
                  </Lift>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* ============ FEATURES ============ */}
          <Section tone="light" joined id="features">
            <SectionTitle>
              Everything for your <span className="lp-g">job search.</span>
            </SectionTitle>

            <div className="mt-16 grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
              {FEATURES.map(({ icon: Icon, title, body }, i) => (
                <Reveal key={title} delay={(i % 3) * 0.1} className="h-full">
                  <Lift>
                    <Card className="relative h-full gap-0 overflow-hidden rounded-[20px] p-[30px] shadow-none">
                      <motion.span
                        aria-hidden
                        variants={{
                          rest: { opacity: 0 },
                          hover: { opacity: 1 },
                        }}
                        transition={{ duration: 0.4 }}
                        className="pointer-events-none absolute -bottom-[60%] -left-[30%] -right-[30%] h-[70%] bg-[radial-gradient(closest-side,rgba(43,227,154,.22),transparent)]"
                      />
                      <div className="lp-g relative mb-[22px] grid size-[46px] place-items-center rounded-[13px] bg-primary/[.14]">
                        <Icon className="size-6" strokeWidth={1.8} />
                      </div>
                      <h3 className="relative text-[22px] font-medium tracking-[-.03em]">
                        {title}
                      </h3>
                      <p className="relative mt-2 text-[15px] text-muted-foreground">
                        {body}
                      </p>
                    </Card>
                  </Lift>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* ============ HOW IT WORKS ============ */}
          <Section tone="dark" id="how">
            <SectionTitle>
              From resume to <span className="lp-g">interview-ready.</span>
            </SectionTitle>

            <div className="mt-[70px] grid grid-cols-4 items-start max-[900px]:grid-cols-2 max-[900px]:gap-y-[34px] max-[520px]:grid-cols-1">
              {STEPS.map(({ icon: Icon, title, body }, i) => (
                <Reveal
                  key={title}
                  delay={i * 0.12}
                  className="relative px-3.5 text-center"
                >
                  <motion.div initial="rest" animate="rest" whileHover="hover">
                    <div className="mb-4 text-[15px] tracking-[.14em] text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <motion.div
                      className="relative"
                      variants={{
                        rest: { y: 0, boxShadow: "0 0 0 0 rgba(43,227,154,0)" },
                        hover: {
                          y: -6,
                          boxShadow: "0 20px 50px -20px rgba(43,227,154,.5)",
                        },
                      }}
                      transition={{ duration: 0.35 }}
                      style={{ borderRadius: 22 }}
                    >
                      <Card className="h-[130px] items-center justify-center gap-0 rounded-[22px] py-0 text-white shadow-none">
                        <Icon
                          className="mx-auto size-[30px] text-primary"
                          strokeWidth={1.8}
                        />
                        <b className="mt-2.5 block text-[19px] font-medium tracking-[-.02em]">
                          {title}
                        </b>
                      </Card>
                      <motion.span
                        aria-hidden
                        variants={{
                          rest: { opacity: 0 },
                          hover: { opacity: 1 },
                        }}
                        transition={{ duration: 0.35 }}
                        className="pointer-events-none absolute inset-0 rounded-[22px] border border-primary"
                      />
                    </motion.div>
                    <p className="mt-4 text-[15px] text-muted-foreground">
                      {body}
                    </p>
                  </motion.div>

                  {i < STEPS.length - 1 && (
                    <svg
                      aria-hidden
                      className="absolute -right-[18px] top-[92px] z-[2] w-9 text-primary max-[900px]:hidden"
                      viewBox="0 0 36 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <motion.line
                        x1="0"
                        y1="6"
                        x2="30"
                        y2="6"
                        strokeDasharray="4 4"
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: -16 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <path d="M26 1l6 5-6 5" />
                    </svg>
                  )}
                </Reveal>
              ))}
            </div>
          </Section>

          {/* ============ RESUME INTELLIGENCE ============ */}
          <Section tone="light">
            <Reveal className="mx-auto grid max-w-[960px] grid-cols-[1fr_60px_1fr] items-center gap-2.5 max-[900px]:grid-cols-1">
              {/* resume "paper" is always white */}
              <Card
                aria-hidden
                className="relative min-h-[330px] gap-0 overflow-hidden rounded-[18px] border-[#e4e7e9] bg-white px-7 py-[26px] text-[#111] shadow-[0_30px_70px_-35px_rgba(0,0,0,.35)]"
              >
                {/* <div className="relative min-h-[330px] overflow-hidden rounded-[18px] border border-zinc-200 bg-white p-7 shadow-xl"> */}
                <motion.div
                  animate={{ y: ["-100%", "500%"] }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-[#2be39a]/30 to-transparent z-50"
                />
                <motion.div
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5
             bg-primary
             shadow-[0_0_15px_3px_hsl(var(--primary))]"
                  animate={{
                    y: ["0%", "1000%"],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20
             bg-gradient-to-b from-primary/20 to-transparent"
                  animate={{
                    y: ["-100%", "500%"],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                    ease: "linear",
                  }}
                />
                <h4 className="text-[22px] font-semibold tracking-[-.03em]">
                  Frontend Developer
                </h4>
                <div className="mt-0.5 text-sm text-[#10a070]">
                  React · Next.js · TS
                </div>
                <div className="my-3 h-2 w-[92%] rounded-md bg-[#eceef0]" />
                <div className="my-3 h-2 w-[78%] rounded-md bg-[#eceef0]" />
                <div className="my-4 flex flex-wrap gap-[7px]">
                  {["React", "Next.js", "TypeScript", "REST APIs"].map((s) => (
                    <Badge
                      key={s}
                      className="rounded-[7px] border-0 bg-[rgba(16,160,112,.12)] px-2.5 py-1 text-xs font-normal text-[#0c8a5f]"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="my-3 h-2 w-[85%] rounded-md bg-[#eceef0]" />
                <div className="my-3 h-2 w-[60%] rounded-md bg-[#eceef0]" />
                <div className="my-3 h-2 w-[72%] rounded-md bg-[#eceef0]" />
              </Card>

              <div
                aria-hidden
                className="lp-g grid place-items-center max-[900px]:rotate-90"
              >
                <motion.div
                  animate={{ x: [0, 8, 0] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight size={44} strokeWidth={2.5} />
                </motion.div>
              </div>

              <Card className="min-h-[330px] gap-0 rounded-[20px] p-7 shadow-none">
                <h4 className="mb-[18px] text-xl font-medium tracking-[-.03em]">
                  Your Resume
                </h4>
                <Stagger items={RESUME_CHECKS} />
              </Card>
            </Reveal>

            <Reveal className="mx-auto mt-[70px] max-w-[640px] text-center">
              <h3 className="text-[clamp(28px,4vw,44px)] font-medium leading-[1.1] tracking-[-.04em]">
                AI understands more than <span className="lp-g">keywords.</span>
              </h3>
              <ScrubText className="mt-[18px] text-[clamp(19px,2.3vw,26px)] font-medium leading-[1.25] tracking-[-.025em]">
                Your resume becomes a structured profile that powers job
                matching and personalized interview preparation.
              </ScrubText>
            </Reveal>
          </Section>

          {/* ============ SMART JOB MATCHING ============ */}
          <Section tone="dark">
            <SectionTitle>
              Find jobs that actually{" "}
              <span className="lp-g">fit your profile.</span>
            </SectionTitle>

            <Reveal className="mx-auto mt-[60px] grid max-w-[900px] grid-cols-[1fr_54px_1fr] items-stretch gap-3.5 max-[900px]:grid-cols-1">
              <ProfilePanel
                label="YOUR PROFILE"
                title="React"
                lines={["Next.js", "TypeScript", "REST APIs"]}
                footnote="2.5 Years Experience"
              />
              <div className="grid place-items-center text-[34px] text-muted-foreground max-[900px]:text-[28px]">
                +
              </div>
              <ProfilePanel
                label="JOB DESCRIPTION"
                title="Frontend Developer"
                lines={["React", "TypeScript", "Next.js"]}
                footnote="2+ Years Experience"
              />
            </Reveal>

            <div
              aria-hidden
              className="my-3.5 grid place-items-center text-primary"
            >
              <motion.div
                animate={{ y: [0, 7, 0] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ArrowDown size={30} strokeWidth={2.5} />
              </motion.div>
            </div>

            <MatchResult />
          </Section>

          {/* ============ AI INTERVIEW ============ */}
          <Section tone="light">
            <SectionTitle className="mx-auto max-w-[860px]">
              Practice interviews designed around the{" "}
              <span className="lp-g">role you&apos;re targeting.</span>
            </SectionTitle>

            <InterviewDemo />

            <Reveal>
              <p className="mt-12 text-center text-[clamp(26px,3.6vw,40px)] font-medium tracking-[-.04em]">
                Practice. Get feedback. <span className="lp-g">Improve.</span>
              </p>
            </Reveal>
          </Section>

          {/* ============ PERSONALIZED LEARNING ============ */}
          <Section tone="dark">
            <SectionTitle>
              Know what to <span className="lp-g">improve next.</span>
            </SectionTitle>

            <SkillsCard />
          </Section>

          {/* ============ APPLICATION TRACKER ============ */}
          <Section tone="light">
            <SectionTitle>
              Keep your job search <span className="lp-g">organized.</span>
            </SectionTitle>

            <ApplicationTracker />
          </Section>

          {/* ============ TESTIMONIALS ============ */}
          <Section tone="dark" id="testimonials">
            <SectionTitle>
              Built for modern <span className="lp-g">job seekers.</span>
            </SectionTitle>

            <div className="mt-[60px] grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.12} className="h-full">
                  <Lift accent="var(--primary)">
                    <Card className="h-full gap-[18px] rounded-[20px] p-7 shadow-none">
                      <div
                        className="text-lg tracking-[3px] text-primary"
                        aria-label="5 stars"
                      >
                        ★★★★★
                      </div>
                      <blockquote className="m-0 text-lg leading-[1.4] tracking-[-.02em] text-[#d9dbdd]">
                        “{t.quote}”
                      </blockquote>
                      <div className="mt-auto flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="size-9 rounded-full bg-[linear-gradient(135deg,#2be39a,#0e7a55)]" />
                        — {t.name}
                      </div>
                    </Card>
                  </Lift>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* ============ FINAL CTA ============ */}
          <Section
            tone="dark"
            id="final"
            className="bg-[radial-gradient(120%_90%_at_50%_120%,#1fd68f_0%,#0a7b52_45%,#04271b_100%)] text-center text-white"
          >
            <Reveal>
              <h2 className="mx-auto max-w-[860px] text-[clamp(36px,6vw,76px)] font-medium leading-none tracking-[-.05em]">
                Ready to make your job search smarter?
              </h2>
            </Reveal>
            <Reveal>
              <p className="mx-auto mt-[26px] max-w-[480px] text-[19px] text-white/[.82]">
                Upload your resume. Find better-fit opportunities. Practice
                interviews. Track your progress.
              </p>
            </Reveal>
            <Reveal className="mt-9">
              <LinkButton
                kind="primary"
                large
                href="#top"
                className="bg-black text-white shadow-[0_20px_60px_-10px_rgba(0,0,0,.6)] hover:bg-black"
                whileHover={{ y: -2, backgroundColor: "#0f1113" }}
              >
                Start For Free
              </LinkButton>
            </Reveal>
          </Section>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
