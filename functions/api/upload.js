/**
 * POST /api/upload — Upload an image to the repo's assets/images/gallery/ folder
 *
 * Accepts multipart/form-data:
 *   token  — admin token
 *   file   — image file (JPEG, PNG, WebP, GIF, AVIF; max 8 MB)
 *
 * Returns: { success, path, rawUrl }
 *   path   — relative URL for storing in JSON  (/assets/images/gallery/name.ext)
 *   rawUrl — immediate preview URL via GitHub raw (before deploy)
 */

const REPO      = 'nevis09/clgcville-website';
const BRANCH    = 'main';
const UPLOAD_DIR = 'assets/images/gallery';
const MAX_BYTES  = 8 * 1024 * 1024; // 8 MB
const ALLOWED    = new Set(['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/avif']);

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestPost({ request, env }) {
  let formData;
  try { formData = await request.formData(); }
  catch { return json({ error: 'Expected multipart/form-data' }, 400); }

  const token = formData.get('token');
  if (!token || token !== env.ADMIN_TOKEN) return json({ error: 'Unauthorized' }, 401);

  const file = formData.get('file');
  if (!file || typeof file === 'string') return json({ error: 'No file provided' }, 400);

  if (!ALLOWED.has(file.type)) return json({ error: 'Unsupported file type. Use JPEG, PNG, WebP, GIF or AVIF.' }, 400);
  if (file.size > MAX_BYTES) return json({ error: `File too large — maximum is 8 MB` }, 400);

  // Sanitise filename and add ms timestamp to prevent collisions
  const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase().replace('jpg', 'jpg');
  const base = file.name.replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40) || 'upload';
  const fileName = `${base}-${Date.now()}.${ext}`;
  const filePath = `${UPLOAD_DIR}/${fileName}`;

  // Convert file to base64 for GitHub Contents API
  const buffer = await file.arrayBuffer();
  const b64    = bufToBase64(buffer);

  // Check if file already exists (get SHA; extremely unlikely for timestamped names)
  const checkRes = await ghFetch(env, `contents/${filePath}`);
  const existing = checkRes.ok ? await checkRes.json() : null;

  const putBody = {
    message: `Admin upload: ${fileName}`,
    content: b64,
    branch:  BRANCH,
    ...(existing?.sha ? { sha: existing.sha } : {}),
  };

  const putRes = await ghFetch(env, `contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify(putBody),
  });

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    return json({ error: err.message || 'GitHub upload failed' }, 502);
  }

  return json({
    success: true,
    path:    `/${filePath}`,
    rawUrl:  `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${filePath}`,
  });
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

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
      Authorization:         `Bearer ${env.GITHUB_TOKEN}`,
      Accept:                'application/vnd.github+json',
      'X-GitHub-Api-Version':'2022-11-28',
      'User-Agent':          'CLG-Cville-Admin/1.0',
      'Content-Type':        'application/json',
      ...(opts.headers || {}),
    },
  });
}

function bufToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
