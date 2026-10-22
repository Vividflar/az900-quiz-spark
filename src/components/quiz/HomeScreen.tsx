import { useState } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { DOMAINS, QUESTION_COUNTS } from "@/lib/quiz";

export function HomeScreen({
  starting,
  onStart,
}: {
  starting: boolean;
  onStart: (domain: string, count: number) => void;
}) {
  const [domain, setDomain] = useState<string | null>(null);
  const [count, setCount] = useState<number>(QUESTION_COUNTS[1]);

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-14 pt-10 sm:max-w-lg">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          AZ-900 practice
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Smart Quiz Builder
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Short, focused quizzes for the Azure Fundamentals exam. Pick a domain,
          answer each question, and see why every option is right or wrong.
        </p>
      </header>

      <section className="mt-9" aria-label="Choose a domain">
        <h2 className="text-sm font-semibold text-foreground">Choose a domain</h2>
        <div className="mt-3 grid gap-3">
          {DOMAINS.map((d, i) => (
            <button
              key={d}
              type="button"
              aria-pressed={domain === d}
              onClick={() => setDomain(d)}
              className={cn(
                "flex items-center justify-between rounded-2xl border bg-card px-4 py-4 text-left transition-colors",
                domain === d
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-primary/50",
              )}
            >
              <span className="text-sm font-semibold text-foreground">{d}</span>
              <span className="font-display text-base text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-7" aria-label="Questions per quiz">
        <h2 className="text-sm font-semibold text-foreground">Questions per quiz</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {QUESTION_COUNTS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={count === c}
              onClick={() => setCount(c)}
              className={cn(
                "rounded-2xl border bg-card px-4 py-3.5 text-sm font-semibold transition-colors",
                count === c
                  ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                  : "border-border text-foreground hover:border-primary/50",
              )}
            >
              {c} questions
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={() => domain && onStart(domain, count)}
        disabled={!domain || starting}
        className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {starting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {starting ? "Preparing your quiz…" : "Start quiz"}
      </button>
    </div>
  );
}
