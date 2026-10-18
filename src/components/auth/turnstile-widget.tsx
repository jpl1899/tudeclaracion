'use client';

import { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile CAPTCHA for the email/password auth forms. Supabase
 * Auth verifies the token server-side (Attack Protection → CAPTCHA), so the
 * forms pass it as `captchaToken`. A token is single-use: remount the widget
 * (change its `key`) after every attempt that did not leave the page.
 *
 * Without NEXT_PUBLIC_TURNSTILE_SITE_KEY the widget renders nothing and the
 * forms submit without a token (only valid while CAPTCHA is off in Supabase).
 */

interface TurnstileRenderOptions {
  'sitekey': string
  'language': string
  'callback': (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || undefined;
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export const turnstileEnabled = SITE_KEY !== undefined;

let scriptLoader: Promise<void> | null = null;

async function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) {
    return;
  }
  scriptLoader ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoader = null;
      reject(new Error('Turnstile script failed to load'));
    };
    document.head.appendChild(script);
  });
  return scriptLoader;
}

export function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY) {
      return;
    }
    let cancelled = false;
    let widgetId: string | undefined;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) {
          return;
        }
        widgetId = window.turnstile.render(containerRef.current, {
          'sitekey': SITE_KEY,
          'language': 'es',
          'callback': token => onToken(token),
          'expired-callback': () => onToken(null),
          'error-callback': () => onToken(null),
        });
      })
      .catch((error: unknown) => {
        console.error('[turnstile]', error);
        onToken(null);
      });

    return () => {
      cancelled = true;
      if (widgetId) {
        window.turnstile?.remove(widgetId);
      }
    };
  }, [onToken]);

  if (!SITE_KEY) {
    return null;
  }
  return <div ref={containerRef} className="min-h-[65px]" />;
}
