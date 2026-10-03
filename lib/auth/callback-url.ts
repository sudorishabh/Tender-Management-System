/**
 * Where to send someone once they're signed in: the page in ?callbackUrl=
 * (set by the proxy when a protected page bounced them to sign in), or home.
 *
 * Only paths on this site are honoured, so a crafted link such as
 * /sign-in?callbackUrl=https://evil.example can't redirect people off-site.
 * Client-only, as it reads the current URL.
 */
export function getPostSignInPath(): string {
  const callbackUrl = new URLSearchParams(window.location.search).get(
    "callbackUrl"
  );
  if (!callbackUrl?.startsWith("/")) return "/";

  try {
    // Resolving catches "//host" and "/\host", which browsers treat as
    // another site even though they start with a slash
    const url = new URL(callbackUrl, window.location.origin);
    if (url.origin !== window.location.origin) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
