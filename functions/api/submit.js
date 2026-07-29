export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const data = await context.request.json();
    const collection = data.collection;

    if (!['prayer_requests', 'testimonies'].includes(collection)) {
      return new Response(JSON.stringify({ error: 'Invalid collection' }), { status: 400 });
    }

    // Get existing collection from GitHub
    const env = context.env;
    const repoOwner = 'nevis09';
    const repoName = 'clgcville-website';
    const branch = 'main';

    // Fetch current collection data
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/_data/${collection}.json?ref=${branch}`;
    const headers = {
      'Authorization': `token ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3.raw'
    };

    let items = [];
    try {
      const res = await fetch(url, { headers });
      if (res.ok) {
        const content = await res.text();
        items = JSON.parse(content);
      }
    } catch (e) {
      items = [];
    }

    // Add new submission
    const submission = {
      id: Date.now().toString(),
      ...data
    };

    items.unshift(submission); // Newest first

    // Auto-archive if > 200 active
    const active = items.filter(i => i.state === 'active');
    if (active.length > 200) {
      const oldest = active.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
      if (oldest) {
        const idx = items.indexOf(oldest);
        items[idx].state = 'archived';
        items[idx].archived_at = new Date().toISOString();
      }
    }

    // Commit to GitHub
    const message = `Add ${collection} submission from ${data.name || 'Anonymous'}`;
    const content = Buffer.from(JSON.stringify(items, null, 2)).toString('base64');

    // Get current file SHA
    const getRes = await fetch(url, { headers });
    let sha = null;
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    const commitData = {
      message,
      content,
      branch,
      ...(sha && { sha })
    };

    const commitUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/_data/${collection}.json`;
    const commitRes = await fetch(commitUrl, {
      method: 'PUT',
      headers: {
        ...headers,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commitData)
    });

    if (!commitRes.ok) {
      const error = await commitRes.text();
      console.error('GitHub commit error:', error);
      return new Response(JSON.stringify({ error: 'Failed to save submission' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, id: submission.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
