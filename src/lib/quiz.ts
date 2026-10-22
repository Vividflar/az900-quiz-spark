// Pure quiz logic — no browser APIs, no network. Shared by screens and tests.

export type QuestionBankRow = {
  id: string;
  domain: string;
  topic: string | null;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  option_explanations: string[] | null;
};

/** A quiz question as served to the UI: the id comes from the questions table row. */
export type QuizQuestion = Omit<QuestionBankRow, "id"> & { id: string };

/** Exact strings used to filter question_bank.domain. */
export const DOMAINS = [
  "Cloud concepts",
  "Azure architecture and services",
  "Azure management and governance",
] as const;

export const QUESTION_COUNTS = [5, 10] as const;

/** Fisher–Yates shuffle; never mutates or reorders the input. */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const moved = out[i];
    const target = out[j];
    if (moved === undefined || target === undefined) continue;
    out[i] = target;
    out[j] = moved;
  }
  return out;
}

/** Shuffle the bank rows and take the chosen number (or fewer if fewer exist). */
export function pickQuestions(rows: readonly QuestionBankRow[], count: number): QuestionBankRow[] {
  return shuffle(rows).slice(0, Math.max(0, count));
}

export function percentScore(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

export function resultMessage(percent: number): string {
  if (percent >= 80) {
    return "Excellent work — you look well prepared on this domain.";
  }
  if (percent >= 50) {
    return "Good effort. Review the explanations below, then run it again to lock it in.";
  }
  return "A solid start. Read the explanations below and try the same domain again — it clicks quickly.";
}
