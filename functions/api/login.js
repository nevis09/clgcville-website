/**
 * POST /api/login
 * Verifies admin credentials against Cloudflare environment variables.
 * Returns a session token on success.
 *
 * Required env vars (set in Cloudflare Pages → Settings → Environment Variables):
 *   ADMIN_USERNAME  — the admin login username
 *   ADMIN_PASSWORD  — the admin login password
 *   ADMIN_TOKEN     — a secret random string used as the session token
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return respond({ error: 'Invalid request body' }, 400);
  }

  const { username, password } = body || {};

  // Guard: check env vars are configured
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD || !env.ADMIN_TOKEN) {
    return respond({
      error: 'Server not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_TOKEN in Cloudflare Pages environment variables.',
    }, 503);
  }

  if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
    return respond({ token: env.ADMIN_TOKEN });
  }

  return respond({ error: 'Incorrect username or password.' }, 401);
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

function respond(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
