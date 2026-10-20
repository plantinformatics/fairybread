import { useEffect, useState } from "react";
import { describeLoadProgress, LOAD_STAGE_COUNT, type LoadProgress } from "@/lib/load-progress";

type LoadingOverlayProps = {
  message?: string;
  /** Server-reported data loading step. When set, replaces `message` with step details. */
  progress?: LoadProgress | null;
};

export function LoadingOverlay({ message = "Loading...", progress = null }: LoadingOverlayProps) {
  const elapsedSeconds = useElapsedSeconds();
  const description = progress ? describeLoadProgress(progress) : null;

  return (
    <div className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-xs">
      <div className="text-muted-foreground bg-card rounded-md text-sm shadow-xs flex max-w-md flex-col gap-2 border px-4 py-3">
        <div className="flex items-center gap-2 leading-none font-medium">
          <svg
            className="text-muted-foreground -ml-1 h-5 w-5 shrink-0 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-shimmer leading-snug">{description?.title ?? message}</span>
          <span className="ml-auto pl-2 text-xs tabular-nums">{elapsedSeconds}s</span>
        </div>
        {description && (
          <>
            {description.fraction !== undefined && (
              <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full transition-[width] duration-300"
                  style={{ width: `${Math.round(description.fraction * 100)}%` }}
                />
              </div>
            )}
            <div className="text-xs leading-snug">
              Step {description.step} of {LOAD_STAGE_COUNT}
              {description.detail && <> · {description.detail}</>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Seconds since the overlay mounted, so long loads visibly keep moving. */
function useElapsedSeconds() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  return seconds;
}
