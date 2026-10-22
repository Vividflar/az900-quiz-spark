import { AlertCircle, Loader2, RotateCcw } from "lucide-react";

export function StateMessage({
  tone,
  title,
  body,
  actionLabel,
  onAction,
}: {
  tone: "loading" | "error" | "empty";
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="mx-auto w-full max-w-md px-5 pb-14 pt-16 text-center sm:max-w-lg"
      role={tone === "loading" ? "status" : "alert"}
    >
      {tone === "loading" ? (
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" aria-hidden />
      ) : (
        <AlertCircle
          className="mx-auto h-8 w-8 text-incorrect"
          aria-hidden
        />
      )}
      <h2 className="mt-4 font-display text-2xl text-foreground">{title}</h2>
      {body && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
