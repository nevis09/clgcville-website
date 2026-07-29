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

    // Use Cloudflare KV Storage instead of GitHub
    const kv = context.env.SUBMISSIONS;

    // Get existing submissions from KV
    let items = [];
    try {
      const kvData = await kv.get(collection);
      if (kvData) {
        items = JSON.parse(kvData);
      }
    } catch (e) {
      console.error('Error reading from KV:', e);
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

    // Save to KV (instant, no timeout)
    await kv.put(collection, JSON.stringify(items));

    return new Response(JSON.stringify({ success: true, id: submission.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
