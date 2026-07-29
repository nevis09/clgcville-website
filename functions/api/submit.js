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

    // Create submission object
    const submission = {
      id: Date.now().toString(),
      ...data,
      submitted_at: new Date().toISOString()
    };

    // Try to save to KV if available
    try {
      const kv = context.env?.SUBMISSIONS;
      if (kv) {
        let items = [];
        try {
          const existing = await kv.get(collection);
          if (existing) items = JSON.parse(existing);
        } catch (e) {
          console.warn('Could not read from KV:', e.message);
        }
        items.unshift(submission);
        await kv.put(collection, JSON.stringify(items));
        console.log(`Saved to KV: ${collection}`);
      } else {
        console.warn('KV binding SUBMISSIONS not available');
      }
    } catch (kvErr) {
      console.error('KV error:', kvErr.message);
    }

    // Return success regardless of KV status
    return new Response(JSON.stringify({
      success: true,
      id: submission.id,
      message: 'Thank you for your submission. Our team will review it shortly.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ error: 'Failed to process submission' }), { status: 500 });
  }
}
