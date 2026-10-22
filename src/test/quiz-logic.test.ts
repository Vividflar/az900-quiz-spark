import { describe, expect, it } from "vitest";

import {
  DOMAINS,
  percentScore,
  pickQuestions,
  shuffle,
  type QuestionBankRow,
} from "@/lib/quiz";

const bank: QuestionBankRow[] = Array.from({ length: 12 }, (_, i) => ({
  id: `q${i}`,
  domain: "Cloud concepts",
  topic: null,
  question: `Question ${i}`,
  options: ["a", "b", "c", "d"],
  correct_index: 0,
  explanation: null,
  option_explanations: null,
}));

// Deterministic rng so the shuffle assertions are stable.
const fixedRng = () => 0.42;

describe("quiz logic", () => {
  it("uses the exact AZ-900 domain strings for filtering question_bank", () => {
    expect(DOMAINS).toEqual([
      "Cloud concepts",
      "Azure architecture and services",
      "Azure management and governance",
    ]);
  });

  it("shuffles without losing or duplicating any question", () => {
    const shuffled = shuffle(bank, fixedRng);
    expect(shuffled).toHaveLength(bank.length);
    expect(new Set(shuffled.map((r) => r.id)).size).toBe(bank.length);
    expect(bank[0].id).toBe("q0"); // input untouched
  });

  it("picks exactly the requested number of questions", () => {
    expect(pickQuestions(bank, 10)).toHaveLength(10);
    expect(pickQuestions(bank, 5)).toHaveLength(5);
  });

  it("caps the pick when the bank has fewer questions than requested", () => {
    expect(pickQuestions(bank.slice(0, 3), 10)).toHaveLength(3);
  });

  it("scores 7 out of 10 as 70 percent", () => {
    expect(percentScore(7, 10)).toBe(70);
  });

  it("never divides by zero on an empty quiz", () => {
    expect(percentScore(0, 0)).toBe(0);
  });
});
