import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  FileText,
  ClipboardList,
  HelpCircle,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.5, ease: 'easeOut' },
  }),
};

function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-surface-dark/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
            StudyHub AI
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300 md:flex">
          <a href="#features" className="hover:text-gray-900 dark:hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-gray-900 dark:hover:text-white">
            How it works
          </a>
          <a href="#ai-tools" className="hover:text-gray-900 dark:hover:text-white">
            AI Tools
          </a>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login" className="btn-ghost">
            Log in
          </Link>
          <Link to="/register" className="btn-primary">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((p) => !p)}
          className="rounded-lg p-2 text-gray-500 md:hidden"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#features" onClick={() => setMobileOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)}>
              How it works
            </a>
            <a href="#ai-tools" onClick={() => setMobileOpen(false)}>
              AI Tools
            </a>
            <div className="mt-2 flex gap-2">
              <Link to="/login" className="btn-secondary flex-1 justify-center">
                Log in
              </Link>
              <Link to="/register" className="btn-primary flex-1 justify-center">
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroPreviewCards() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Main card - AI summary readiness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.55, ease: 'easeOut' }}
        className="card"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Chapter 7 — Thermodynamics
            </p>
            <p className="text-xs text-gray-400">AI Summary · ready</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <Sparkles className="h-3 w-3" /> AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-brand-100 dark:border-brand-900">
            <span className="text-lg font-bold text-brand-700 dark:text-brand-300">8</span>
            <span className="absolute -bottom-1 rounded-full bg-brand-600 px-1.5 text-[9px] font-medium text-white">
              concepts
            </span>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-2 w-4/5 rounded-full bg-brand-500" />
            </div>
            <p className="text-xs text-gray-400">3 formulas · 5 exam tips extracted</p>
          </div>
        </div>
      </motion.div>

      {/* Floating card - auto-graded quiz */}
      <motion.div
        initial={{ opacity: 0, y: 10, x: 10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.55, duration: 0.5, ease: 'easeOut' }}
        className="card absolute -right-4 -top-8 w-44 sm:-right-8"
      >
        <p className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Auto-graded
        </p>
        <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">9 / 10</p>
        <p className="text-xs text-gray-400">Scored in under 2 seconds</p>
      </motion.div>

      {/* Floating card - chat with notes */}
      <motion.div
        initial={{ opacity: 0, y: 10, x: -10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
        className="card absolute -bottom-10 -left-4 w-56 sm:-left-10"
      >
        <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          <MessageSquare className="h-3.5 w-3.5" /> Chat with your notes
        </p>
        <p className="text-xs text-gray-700 dark:text-gray-300">
          "Why does entropy always increase in an isolated system?"
        </p>
      </motion.div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-100 opacity-60 blur-3xl dark:bg-brand-900/30" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-brand-50 opacity-70 blur-3xl dark:bg-brand-900/20" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:py-28">
        <div>
          <motion.span
            custom={0}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
          >
            <Sparkles className="h-3.5 w-3.5" /> Your class, plus an AI study partner
          </motion.span>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-5 font-display text-4xl leading-[1.1] text-gray-900 dark:text-gray-100 sm:text-5xl"
          >
            Make your notes
            <br />
            work <span className="italic text-brand-600 dark:text-brand-400">harder for you.</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-5 max-w-md text-base text-gray-500 dark:text-gray-400"
          >
            Upload your course material and StudyHub AI turns it into summaries, practice quizzes,
            and answers — so you spend less time re-reading and more time actually learning it.
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/register" className="btn-primary px-5 py-2.5 text-base">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how-it-works" className="btn-secondary px-5 py-2.5 text-base">
              See how it works
            </a>
          </motion.div>

          <motion.p
            custom={4}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-4 text-xs text-gray-400"
          >
            Free for students and teachers · No credit card required
          </motion.p>
        </div>

        <HeroPreviewCards />
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: FileText,
    title: 'Notes, organized',
    desc: 'Upload PDFs, slides, and docs by subject. Bookmark what matters and find it again in seconds.',
  },
  {
    icon: ClipboardList,
    title: 'Assignments & grading',
    desc: 'Submit work, track due dates, and get feedback — teachers grade with rubrics built right in.',
  },
  {
    icon: HelpCircle,
    title: 'Quizzes that grade themselves',
    desc: "MCQ and true/false questions are scored instantly. Short answers wait for a teacher's eye.",
  },
  {
    icon: Sparkles,
    title: 'AI Notes Summarizer',
    desc: 'Turn any upload into a summary, key concepts, definitions, and exam tips in one click.',
  },
  {
    icon: MessageSquare,
    title: 'Chat with your notes',
    desc: 'Ask a question about a specific document and get an answer grounded in what you uploaded.',
  },
  {
    icon: BarChart3,
    title: 'Progress you can see',
    desc: 'Students track scores over time. Teachers see class performance at a glance.',
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl text-gray-900 dark:text-gray-100">
          Everything a class actually needs
        </h2>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          No bloat — just the tools students and teachers use every week, plus AI where it genuinely
          saves time.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="card transition-shadow hover:shadow-soft-lg"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{f.title}</h3>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    title: 'Create your account',
    desc: 'Sign up as a student or a teacher — it takes under a minute, no credit card needed.',
  },
  {
    title: 'Join or create a subject',
    desc: 'Teachers set up a subject and enroll students. Students land straight in their class materials.',
  },
  {
    title: 'Study with AI alongside you',
    desc: "Summarize a note, generate a quiz, or ask a question — the AI tools work with what's already been uploaded.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface-subtle py-20 dark:bg-surface-dark-subtle/40">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl text-gray-900 dark:text-gray-100">
            Up and running in three steps
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <span className="font-display text-2xl text-brand-300 dark:text-brand-700">
                0{i + 1}
              </span>
              <h3 className="mt-2 font-semibold text-gray-900 dark:text-gray-100">{s.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const AI_TOOLS = [
  'Notes Summarizer',
  'Quiz Generator',
  'Chat With Notes',
  'Doubt Solver',
  'Assignment Checker',
];

function AiToolsBand() {
  return (
    <section id="ai-tools" className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
      <div className="card overflow-hidden bg-brand-600 p-8 text-white sm:p-12">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-brand-100">
              <Sparkles className="h-4 w-4" /> Five AI tools, built into the workflow
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl">
              Not a chatbot bolted on the side.
            </h2>
            <p className="mt-2 max-w-md text-sm text-brand-100">
              Every AI tool reads what's actually been uploaded to your class — so answers are
              grounded in your material, not the open internet.
            </p>
          </div>
          <Link to="/register" className="btn bg-white text-brand-700 hover:bg-brand-50">
            Try it free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {AI_TOOLS.map((t) => (
            <span key={t} className="rounded-full bg-white/15 px-3 py-1.5 text-sm">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-gray-400 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600 text-white">
            <GraduationCap className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium text-gray-600 dark:text-gray-300">StudyHub AI</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#features" className="hover:text-gray-600 dark:hover:text-gray-300">
            Features
          </a>
          <Link to="/login" className="hover:text-gray-600 dark:hover:text-gray-300">
            Log in
          </Link>
          <Link to="/register" className="hover:text-gray-600 dark:hover:text-gray-300">
            Sign up
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} StudyHub AI</p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-surface-dark">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <AiToolsBand />
      <Footer />
    </div>
  );
}
