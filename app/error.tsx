"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl text-foreground font-display">Something didn&apos;t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Try again — if it keeps happening, refresh the page.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
