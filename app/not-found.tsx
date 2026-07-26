import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-sm uppercase tracking-widest text-primary">ReciPeel</p>
        <h1 className="mt-2 text-6xl text-foreground font-display">404</h1>
        <p className="mt-3 text-muted-foreground">
          This page slipped out of the pantry.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
