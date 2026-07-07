/**
 * Centralized, validated Supabase environment configuration.
 *
 * Access MUST stay static (`process.env.NEXT_PUBLIC_*`) — Next.js replaces
 * these literals at build time for the browser bundle. A dynamic lookup
 * (`process.env[name]`) silently resolves to `undefined` client-side.
 *
 * Only the browser-safe values live here (URL + publishable key). The
 * secret key is never read by application runtime code in this project —
 * it is only used out-of-band by the Supabase MCP server (see .mcp.json).
 */

function requireEnv(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and fill in your Supabase project credentials (see .context/backend-setup.md).`,
    );
  }
  return value.trim();
}

export const supabaseUrl = requireEnv(
  'NEXT_PUBLIC_SUPABASE_URL',
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const supabasePublishableKey = requireEnv(
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
