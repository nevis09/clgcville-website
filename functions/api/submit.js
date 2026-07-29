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

    // Log submission (visible in Cloudflare logs)
    console.log(`New ${collection} submission:`, submission);

    // Return success immediately
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
