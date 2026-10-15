/**
 * Minimal fixed-window rate limiter. Counts live in this server process,
 * which matches the single-server deployment (uploads are on local disk too);
 * running several instances would need a shared store such as Redis.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

// Expired windows are only swept once this many keys are tracked
const SWEEP_THRESHOLD = 10_000;

const sweepExpired = (now: number) => {
  if (windows.size < SWEEP_THRESHOLD) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
};

/**
 * Records one attempt for `key` and returns true once more than `limit`
 * attempts were made within the current `windowMs` window.
 */
export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const window = windows.get(key);

  if (!window || window.resetAt <= now) {
    sweepExpired(now);
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return limit < 1;
  }

  window.count += 1;
  return window.count > limit;
}

/**
 * Best-effort client address. Next.js fills X-Forwarded-For with the socket
 * address when nothing else set it, but a client can send its own value
 * unless a reverse proxy in front of the app overwrites the header.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
