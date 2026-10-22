import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { HomeScreen } from "@/components/quiz/HomeScreen";
import { QuizScreen, type QuizResults } from "@/components/quiz/QuizScreen";
import { ResultsScreen } from "@/components/quiz/ResultsScreen";
import { StateMessage } from "@/components/quiz/StateMessage";
import {
  EmptyDomainError,
  QuizDataError,
  completeSession,
  startQuiz,
} from "@/lib/quizApi";
import type { QuizQuestion } from "@/lib/quiz";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Quiz Builder — AZ-900 Prep (Unofficial)" },
      {
        name: "description",
        content:
          "Practise for the Azure Fundamentals (AZ-900) exam with short quizzes of original questions across all three exam domains, with an explanation for every option.",
      },
      {
        property: "og:title",
        content: "Smart Quiz Builder — AZ-900 Prep (Unofficial)",
      },
      {
        property: "og:description",
        content:
          "Original AZ-900 practice questions with per-option explanations across all three exam domains.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Stage =
  | { name: "home" }
  | { name: "quiz"; sessionId: string; domain: string; questions: QuizQuestion[] }
  | { name: "results"; results: QuizResults };

type StartRequest = { domain: string; count: number };

function Index() {
  const [stage, setStage] = useState<Stage>({ name: "home" });
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(false);
  const [emptyDomain, setEmptyDomain] = useState<string | null>(null);
  const [pending, setPending] = useState<StartRequest | null>(null);
  const [unsaved, setUnsaved] = useState<{ sessionId: string; results: QuizResults } | null>(null);

  // Each screen change starts from the top.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stage]);

  async function runStart({ domain, count }: StartRequest) {
    setStarting(true);
    setStartError(false);
    setEmptyDomain(null);
    try {
      const { sessionId, questions } = await startQuiz(domain, count);
      setStage({ name: "quiz", sessionId, domain, questions });
    } catch (error) {
      if (error instanceof EmptyDomainError) {
        setEmptyDomain(domain);
      } else {
        setStartError(true);
      }
    } finally {
      setStarting(false);
    }
  }

  function start(request: StartRequest) {
    setPending(request);
    void runStart(request);
  }

  async function runComplete(sessionId: string, results: QuizResults) {
    try {
      await completeSession(sessionId, results.score);
      setUnsaved(null);
      setStage({ name: "results", results });
    } catch {
      setUnsaved({ sessionId, results });
    }
  }

  function finish(sessionId: string, results: QuizResults) {
    void runComplete(sessionId, results);
  }

  let content: React.ReactNode;
  if (startError) {
    content = (
      <StateMessage
        tone="error"
        title="We couldn't load the quiz"
        body="Something went wrong while reaching the question bank. Please try again."
        actionLabel="Try again"
        onAction={() => pending && start(pending)}
      />
    );
  } else if (emptyDomain) {
    content = (
      <StateMessage
        tone="empty"
        title="No questions yet"
        body={`There are no questions for "${emptyDomain}" in the bank right now. Please check back later.`}
        actionLabel="Back"
        onAction={() => {
          setEmptyDomain(null);
          setStage({ name: "home" });
        }}
      />
    );
  } else if (unsaved) {
    content = (
      <StateMessage
        tone="error"
        title="We couldn't save your result"
        body="Your answers are safe on this screen. Please try saving again."
        actionLabel="Try again"
        onAction={() => void runComplete(unsaved.sessionId, unsaved.results)}
      />
    );
  } else if (stage.name === "quiz") {
    content = (
      <QuizScreen
        domain={stage.domain}
        sessionId={stage.sessionId}
        questions={stage.questions}
        onFinish={(results) => finish(stage.sessionId, results)}
      />
    );
  } else if (stage.name === "results") {
    content = (
      <ResultsScreen
        results={stage.results}
        onTryAgain={() =>
          pending
            ? start({ domain: stage.results.domain, count: pending.count })
            : setStage({ name: "home" })
        }
        onNewDomain={() => setStage({ name: "home" })}
      />
    );
  } else {
    content = <HomeScreen
      starting={starting}
      onStart={(domain, count) => start({ domain, count })}
    />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">{content}</main>
      <footer className="border-t border-border px-5 py-6">
        <p className="mx-auto max-w-md text-center text-xs leading-relaxed text-muted-foreground sm:max-w-lg">
          Unofficial AZ-900 prep tool. Not affiliated with or endorsed by
          Microsoft. All questions are original, AI-written practice questions.
        </p>
      </footer>
    </div>
  );
}
