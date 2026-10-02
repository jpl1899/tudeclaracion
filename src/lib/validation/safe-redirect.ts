const PROBE_ORIGIN = 'http://internal.invalid';

/**
 * Returns `next` only when it is a same-origin path, else `fallback`.
 * Guards the post-auth `?next=` redirect against open redirects
 * (threat-model item 2).
 *
 * Resolving against a fixed origin catches every way a browser can turn a
 * "path" into another host: `//host`, `/\host`, and control chars that
 * browsers strip (`/\t/host`).
 */
export function safeInternalPath(next: string | null, fallback: string): string {
  if (!next || !next.startsWith('/')) {
    return fallback;
  }

  const url = new URL(next, PROBE_ORIGIN);
  if (url.origin !== PROBE_ORIGIN) {
    return fallback;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
