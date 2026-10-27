"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="shell py-24 max-w-xl">
      <h1 className="text-2xl font-bold">This view could not be loaded</h1>
      <p className="my-5">
        Try loading it again. Reports are held only in this browser view; a
        reload may require uploading the document again.
      </p>
      <button type="button" onClick={reset} className="button button-dark">
        Try again
      </button>
    </main>
  );
}
