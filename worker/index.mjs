// Receives the message of the contact form and sends it to my inbox with Resend. It lives apart
// from the site (Cloudflare Workers, free plan) because the site is static. The API key is the
// secret RESEND_API_KEY (npx wrangler secret put RESEND_API_KEY), never in the repository.

const LIMITS = { name: 120, email: 254, message: 5000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const allowedOrigins = (env) => (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean);

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  Vary: 'Origin',
});

const reply = (success, status, origin) =>
  new Response(JSON.stringify({ success: String(success) }), {
    status,
    headers: { 'Content-Type': 'application/json', ...(origin ? corsHeaders(origin) : {}) },
  });

// Without JavaScript the form is a plain post: it goes back to the page it came from.
const goBack = (next, env) => {
  const origin = (() => {
    try {
      return new URL(next).origin;
    } catch {
      return null;
    }
  })();
  const target = origin && allowedOrigins(env).includes(origin) ? next : allowedOrigins(env)[0];
  return new Response(null, { status: 303, headers: { Location: target } });
};

const readFields = async (request) => {
  const type = request.headers.get('Content-Type') ?? '';
  if (type.includes('application/json')) return { fields: await request.json().catch(() => ({})), json: true };
  const form = await request.formData().catch(() => new FormData());
  return { fields: Object.fromEntries(form), json: false };
};

export async function handle(request, env, send = fetch) {
  const origin = request.headers.get('Origin');
  const allowed = origin && allowedOrigins(env).includes(origin) ? origin : null;

  if (request.method === 'OPTIONS') {
    return allowed ? new Response(null, { status: 204, headers: corsHeaders(allowed) }) : new Response(null, { status: 403 });
  }
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST, OPTIONS' } });
  // A browser always sends its origin on a cross-site post, so a request without a known one is not my form.
  if (!allowed) return new Response(null, { status: 403 });

  const { fields, json } = await readFields(request);
  const done = (success, status) => (json ? reply(success, status, allowed) : goBack(fields.next, env));

  // The hidden field is for bots: a person never fills it. It is answered as if it had worked.
  if (String(fields.website ?? '').trim()) return done(true, 200);

  const name = String(fields.name ?? '').trim();
  const email = String(fields.email ?? '').trim();
  const message = String(fields.message ?? '').trim();
  const valid =
    name && email && message &&
    name.length <= LIMITS.name && email.length <= LIMITS.email && message.length <= LIMITS.message &&
    EMAIL.test(email);
  if (!valid) return done(false, 400);

  const response = await send('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Portfolio <onboarding@resend.dev>',
      to: [env.TO_EMAIL],
      reply_to: email,
      subject: 'Portfolio - nuevo mensaje',
      text: `Nombre: ${name}\nEmail: ${email}\n\n${message}`,
    }),
  });
  return done(response.ok, response.ok ? 200 : 502);
}

export default { fetch: (request, env) => handle(request, env) };
