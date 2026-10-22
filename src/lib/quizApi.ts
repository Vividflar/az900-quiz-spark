import { supabase } from "@/integrations/supabase/client";
import {
  pickQuestions,
  type QuestionBankRow,
  type QuizQuestion,
} from "@/lib/quiz";

/** A database call failed. The UI maps this to friendly copy — never raw error text. */
export class QuizDataError extends Error {}

/** The chosen domain has no questions in the bank. */
export class EmptyDomainError extends Error {}

const QUESTION_COLUMNS =
  "id, domain, topic, question, options, correct_index, explanation, option_explanations";

/** Anonymous session only — there is no login screen. Signs in silently if needed. */
export async function ensureSignedIn(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return;
  const { error } = await supabase.auth.signInAnonymously();
  if (error) throw new QuizDataError("sign-in");
}

/**
 * Reads every question_bank row for the domain, shuffles, takes `count`,
 * inserts a quiz_sessions row, copies the picked questions into the questions
 * table, and returns the inserted rows (with their new ids) as the quiz.
 */
export async function startQuiz(
  domain: string,
  count: number,
): Promise<{ sessionId: string; questions: QuizQuestion[] }> {
  await ensureSignedIn();

  const { data: bankRows, error: bankError } = await supabase
    .from("question_bank")
    .select(QUESTION_COLUMNS)
    .eq("domain", domain);
  if (bankError) throw new QuizDataError("load");

  const picked = pickQuestions((bankRows ?? []) as QuestionBankRow[], count);
  if (picked.length === 0) throw new EmptyDomainError();

  const { data: sessionRow, error: sessionError } = await supabase
    .from("quiz_sessions")
    .insert({ domain, total: picked.length })
    .select("id")
    .single();
  if (sessionError || !sessionRow) throw new QuizDataError("session");

  const { data: inserted, error: insertError } = await supabase
    .from("questions")
    .insert(
      picked.map((q) => ({
        session_id: sessionRow.id,
        domain: q.domain,
        topic: q.topic,
        question: q.question,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
        option_explanations: q.option_explanations,
      })),
    )
    .select(QUESTION_COLUMNS);
  if (insertError || !inserted || inserted.length === 0)
    throw new QuizDataError("questions");

  return { sessionId: sessionRow.id, questions: inserted as QuizQuestion[] };
}

/** Best-effort: a failed attempt log never blocks the quiz. */
export async function recordAttempt(
  sessionId: string,
  questionId: string,
  selectedIndex: number,
  isCorrect: boolean,
): Promise<void> {
  try {
    const { error } = await supabase.from("attempts").insert({
      session_id: sessionId,
      question_id: questionId,
      selected_index: selectedIndex,
      is_correct: isCorrect,
    });
    if (error) console.warn("attempt not saved");
  } catch {
    console.warn("attempt not saved");
  }
}

/** Fills in the score and completion time on the quiz_sessions row. */
export async function completeSession(sessionId: string, score: number): Promise<void> {
  const { error } = await supabase
    .from("quiz_sessions")
    .update({ score, completed_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw new QuizDataError("complete");
}
