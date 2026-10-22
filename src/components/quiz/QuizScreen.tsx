import { useRef, useState } from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/quiz";
import { recordAttempt } from "@/lib/quizApi";

const LETTERS = ["A", "B", "C", "D"];

export type MissedQuestion = {
  question: string;
  correctAnswer: string;
  explanation: string | null;
};

export type QuizResults = {
  domain: string;
  total: number;
  score: number;
  missed: MissedQuestion[];
};

type OptionState = "idle" | "correct" | "incorrect" | "dim";

export function QuizScreen({
  domain,
  sessionId,
  questions,
  onFinish,
}: {
  domain: string;
  sessionId: string;
  questions: QuizQuestion[];
  onFinish: (results: QuizResults) => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [missed, setMissed] = useState<MissedQuestion[]>([]);
  const nextRef = useRef<HTMLButtonElement>(null);

  const question = questions[index];
  const answered = selected !== null;
  const isLast = index === questions.length - 1;
  const progress = ((index + (answered ? 1 : 0)) / questions.length) * 100;

  function choose(optionIndex: number) {
    if (answered) return;
    setSelected(optionIndex);
    const isCorrect = optionIndex === question.correct_index;
    if (!isCorrect) {
      setMissed((prev) => [
        ...prev,
        {
          question: question.question,
          correctAnswer: question.options[question.correct_index] ?? "",
          explanation: question.explanation,
        },
      ]);
    }
    // Best-effort logging — the quiz never blocks on it.
    void recordAttempt(sessionId, question.id, optionIndex, isCorrect);
    requestAnimationFrame(() => nextRef.current?.focus());
  }

  function next() {
    if (isLast) {
      onFinish({
        domain,
        total: questions.length,
        score: questions.length - missed.length,
        missed,
      });
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-14 pt-8 sm:max-w-lg">
      <div className="flex items-center justify-between gap-4">
        <span className="truncate text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {domain}
        </span>
        <span className="shrink-0 text-sm text-muted-foreground">
          Question {index + 1} of {questions.length}
        </span>
      </div>

      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={index + 1}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h2 className="mt-7 font-display text-2xl leading-snug text-foreground">
        {question.question}
      </h2>

      <div className="mt-6 grid gap-2.5">
        {question.options.map((option, i) => {
          const state: OptionState = !answered
            ? "idle"
            : i === question.correct_index
              ? "correct"
              : i === selected
                ? "incorrect"
                : "dim";
          const note = answered ? question.option_explanations?.[i] : null;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => choose(i)}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border bg-card px-4 py-3.5 text-left transition-colors",
                state === "idle" && "border-border hover:border-primary/50 hover:bg-primary/5",
                state === "correct" && "border-correct bg-correct-soft",
                state === "incorrect" && "border-incorrect bg-incorrect-soft",
                state === "dim" && "border-border opacity-60",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold",
                  state === "idle" && "border-border text-muted-foreground",
                  state === "correct" && "border-correct text-correct",
                  state === "incorrect" && "border-incorrect text-incorrect",
                  state === "dim" && "border-border text-muted-foreground",
                )}
              >
                {LETTERS[i] ?? i + 1}
              </span>
              <span className="flex-1 text-sm leading-relaxed text-foreground">
                {option}
                {note && (
                  <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                    {note}
                  </span>
                )}
              </span>
              {state === "correct" && (
                <Check className="mt-1 h-4 w-4 shrink-0 text-correct" aria-label="Correct answer" />
              )}
              {state === "incorrect" && (
                <X className="mt-1 h-4 w-4 shrink-0 text-incorrect" aria-label="Your answer" />
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-5 animate-in fade-in slide-in-from-bottom-1 rounded-2xl border border-border bg-card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            Explanation
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {question.explanation ?? "No explanation was provided for this question."}
          </p>
        </div>
      )}

      {answered && (
        <button
          ref={nextRef}
          type="button"
          onClick={next}
          className="mt-6 w-full animate-in fade-in rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {isLast ? "See results" : "Next question"}
        </button>
      )}
    </div>
  );
}
