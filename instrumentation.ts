// Runs once when the Next.js server starts. Mirrors server console output to
// logs/server.log. Skipped on Vercel, where the filesystem is read-only.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.VERCEL) return;
  const { mirrorConsoleToFile } = await import("./lib/server-log");
  mirrorConsoleToFile("logs/server.log");
}
