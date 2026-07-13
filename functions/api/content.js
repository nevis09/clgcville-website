/**
 * /api/content — Content CRUD via GitHub API
 *
 * GET  /api/content?section=settings       → read a single JSON file
 * GET  /api/content?section=sermons        → list all items in a folder
 * PUT  /api/content   { token, section, data, ?fileName } → create/update file
 * DELETE /api/content { token, filePath }  → delete a file
 *
 * Required env vars (Cloudflare Pages → Settings → Environment Variables):
 *   ADMIN_TOKEN   — must match the token issued by /api/login
 *   GITHUB_TOKEN  — Fine-grained PAT with Contents read+write on this repo
 */

const REPO   = 'nevis09/clgcville-website';
const BRANCH = 'main';

// Single-file sections
const SINGLE = {
  settings: '_data/settings.json',
  home:     '_data/home.json',
  pastor:   '_data/pastor.json',
};

// Collection folder sections
const FOLDERS = {
  sermons:       '_data/sermons',
  events:        '_data/events',
  announcements: '_data/announcements',
  ministries:    '_data/ministries',
  gallery:       '_data/gallery',
};

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── GET ────────────────────────────────────────────
export async function onRequestGet(context) {
  const { request, env } = context;
  const url     = new URL(request.url);
  const section = url.searchParams.get('section');

  // Single-file section — read from raw GitHub (no auth needed for public repo)
  if (SINGLE[section]) {
    const res = await fetch(
      `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${SINGLE[section]}?cb=${Date.now()}`
    );
    if (!res.ok) return json({ error: 'File not found' }, 404);
    const data = await res.json();
    return json(data);
  }

  // Collection folder — list files via GitHub API
  if (FOLDERS[section]) {
    const listRes = await ghFetch(env, `contents/${FOLDERS[section]}`);
    if (listRes.status === 404) return json({ items: [] });
    if (!listRes.ok)            return json({ error: 'Could not list files' }, 502);

    const files = await listRes.json();
    if (!Array.isArray(files))  return json({ items: [] });

    const jsonFiles = files.filter(f => f.name.endsWith('.json'));

    // Fetch each file's content in parallel
    const items = await Promise.all(
      jsonFiles.map(async f => {
        const r = await fetch(
          `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${f.path}?cb=${Date.now()}`
        );
        if (!r.ok) return null;
        const data = await r.json();
        return { ...data, _path: f.path };
      })
    );

    return json({ items: items.filter(Boolean) });
  }

  return json({ error: `Unknown section: "${section}"` }, 400);
}

// ── PUT ────────────────────────────────────────────
export async function onRequestPut(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON body' }, 400); }

  const { token, section, data, fileName } = body || {};

  if (token !== env.ADMIN_TOKEN) return json({ error: 'Unauthorized' }, 401);
  if (!section || !data)         return json({ error: 'Missing section or data' }, 400);

  // Resolve file path
  let filePath;
  if (SINGLE[section]) {
    filePath = SINGLE[section];
  } else if (FOLDERS[section] && fileName) {
    filePath = `${FOLDERS[section]}/${fileName}`;
  } else {
    return json({ error: 'Invalid section or missing fileName for collection' }, 400);
  }

  // Check if file already exists (need its SHA for updates)
  let sha;
  const existingRes = await ghFetch(env, `contents/${filePath}`);
  if (existingRes.ok) {
    const existing = await existingRes.json();
    sha = existing.sha;
  }

  // Base64-encode the content
  const content = b64(JSON.stringify(data, null, 2));

  const putBody = {
    message: `Admin update: ${section}`,
    content,
    branch: BRANCH,
  };
  if (sha) putBody.sha = sha;

  const putRes = await ghFetch(env, `contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify(putBody),
  });

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    return json({ error: err.message || 'GitHub API error' }, 502);
  }

  return json({ success: true });
}

// ── DELETE ─────────────────────────────────────────
export async function onRequestDelete(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON body' }, 400); }

  const { token, filePath } = body || {};

  if (token !== env.ADMIN_TOKEN) return json({ error: 'Unauthorized' }, 401);
  if (!filePath)                  return json({ error: 'filePath is required' }, 400);

  // Get current SHA
  const getRes = await ghFetch(env, `contents/${filePath}`);
  if (!getRes.ok) return json({ error: 'File not found' }, 404);
  const { sha } = await getRes.json();

  const delRes = await ghFetch(env, `contents/${filePath}`, {
    method: 'DELETE',
    body: JSON.stringify({
      message: `Admin delete: ${filePath}`,
      sha,
      branch: BRANCH,
    }),
  });

  if (!delRes.ok) {
    const err = await delRes.json().catch(() => ({}));
    return json({ error: err.message || 'GitHub delete failed' }, 502);
  }

  return json({ success: true });
}

// ── OPTIONS (CORS preflight) ────────────────────────
export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

// ── Helpers ────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function ghFetch(env, path, opts = {}) {
  return fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'CLG-Cville-Admin/1.0',
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
}

function b64(str) {
  // Encode UTF-8 string to base64 (Workers runtime compatible)
  return btoa(unescape(encodeURIComponent(str)));
}
