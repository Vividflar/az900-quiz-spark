import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { percentScore, resultMessage } from "@/lib/quiz";
import type { QuizResults } from "@/components/quiz/QuizScreen";

export function ResultsScreen({
  results,
  onTryAgain,
  onNewDomain,
}: {
  results: QuizResults;
  onTryAgain: () => void;
  onNewDomain: () => void;
}) {
  const percent = percentScore(results.score, results.total);

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-14 pt-12 sm:max-w-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {results.domain}
      </p>
      <h1 className="mt-3 font-display text-6xl leading-none text-foreground">
        {results.score}
        <span className="text-muted-foreground"> / {results.total}</span>
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">{percent}% correct</p>

      <p className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground">
        {resultMessage(percent)}
      </p>

      {results.missed.length > 0 ? (
        <section className="mt-9" aria-label="Review the questions you missed">
          <h2 className="font-display text-2xl text-foreground">Review your misses</h2>
          <div className="mt-4 grid gap-4">
            {results.missed.map((miss, i) => (
              <article key={i} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold leading-relaxed text-foreground">
                  {miss.question}
                </p>
                <p className="mt-3 flex items-start gap-2 text-sm text-correct">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    <span className="font-semibold">Correct answer:</span> {miss.correctAnswer}
                  </span>
                </p>
                {miss.explanation && (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {miss.explanation}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : (
        <p className="mt-8 flex items-center gap-2 text-sm font-semibold text-correct">
          <Check className="h-4 w-4" aria-hidden /> A perfect score — nothing to review.
        </p>
      )}

      <div className="mt-10 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onTryAgain}
          className={cn(
            "rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground",
            "transition-colors hover:bg-primary/90",
          )}
        >
          Try again
        </button>
        <button
          type="button"
          onClick={onNewDomain}
          className={cn(
            "rounded-2xl border border-border bg-card px-4 py-4 text-sm font-semibold text-foreground",
            "transition-colors hover:border-primary/50",
          )}
        >
          New domain
        </button>
      </div>
    </div>
  );
}
