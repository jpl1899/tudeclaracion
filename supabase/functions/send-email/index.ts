import { Webhook } from 'npm:standardwebhooks@1';
import { Resend } from 'npm:resend@6';

/**
 * Supabase Auth "Send Email" Hook — see ADR-0002. Replaces Supabase's
 * default (test-only, rate-limited) mailer for every Auth email in this
 * project. Renders the same copy already shipped on the signup /
 * forgot-password / reset-password pages, and delivers via Resend.
 *
 * Contract: https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
 * Payload: { user: { email }, email_data: { token_hash, redirect_to,
 * email_action_type, site_url } }.
 */

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const hookSecret = (Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? '').replace('v1,whsec_', '');

interface EmailData {
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
}

interface HookPayload {
  user: { email: string };
  email_data: EmailData;
}

/**
 * Builds the link to the app's own /auth/confirm route. `email_data.site_url`
 * is the Supabase Auth API URL (https://<ref>.supabase.co/auth/v1), NOT the
 * app, so the app origin comes from `redirect_to` — the emailRedirectTo /
 * redirectTo the app passed (e.g. https://app/auth/confirm?next=/inicio).
 * The route reads `next`, so it is forwarded from `redirect_to` as-is.
 */
function buildConfirmUrl(actionType: string, data: EmailData): string {
  const target = new URL(data.redirect_to);
  const url = new URL('/auth/confirm', target.origin);
  url.searchParams.set('token_hash', data.token_hash);
  url.searchParams.set('type', actionType);
  const next = target.searchParams.get('next');
  if (next) {
    url.searchParams.set('next', next);
  }
  return url.toString();
}

function buildEmail(actionType: string, data: EmailData): { subject: string, html: string } {
  const confirmUrl = buildConfirmUrl(actionType, data);

  if (actionType === 'recovery') {
    return {
      subject: 'Recuperar acceso a tuDeclaracion.com',
      html: `
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p><a href="${confirmUrl}">Restablecer contraseña</a></p>
        <p>Si vos no pediste este cambio, podés ignorar este correo.</p>
      `,
    };
  }

  // Default: signup / email-change confirmation.
  return {
    subject: 'Confirmá tu cuenta en tuDeclaracion.com',
    html: `
      <p>Confirmá tu cuenta para habilitar el acceso a tu estudio.</p>
      <p><a href="${confirmUrl}">Confirmar cuenta</a></p>
      <p>Si vos no creaste esta cuenta, podés ignorar este correo.</p>
    `,
  };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  let verified: HookPayload;
  try {
    const wh = new Webhook(hookSecret);
    verified = wh.verify(payload, headers) as HookPayload;
  }
  catch (error) {
    console.error('webhook verification failed:', error);
    return Response.json({ error: 'invalid webhook signature' }, { status: 401 });
  }

  const { user, email_data: emailData } = verified;
  const { subject, html } = buildEmail(emailData.email_action_type, emailData);

  const { error } = await resend.emails.send({
    from: 'tuDeclaracion.com <onboarding@resend.dev>',
    to: [user.email],
    subject,
    html,
  });

  if (error) {
    console.error('resend send failed:', error);
    return Response.json({ error: 'failed to send email' }, { status: 500 });
  }

  return Response.json({});
});
