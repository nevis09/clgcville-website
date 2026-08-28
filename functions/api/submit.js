import { sendNotificationEmail } from '../_lib/email.js';

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

    context.waitUntil(notifyNewSubmission(context.env, collection, submission));
    if (submission.email) {
      context.waitUntil(sendSubmitterConfirmation(context.env, collection, submission));
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

function notifyNewSubmission(env, collection, submission) {
  const isPrayer = collection === 'prayer_requests';
  const name = submission.name?.trim() || 'Anonymous';
  const bodyText = (isPrayer ? submission.request : submission.testimony) || '';
  const snippet = bodyText.length > 220 ? bodyText.slice(0, 220) + '…' : bodyText;

  const rows = [
    { label: 'From', value: name },
  ];
  if (submission.email) rows.push({ label: 'Email', value: submission.email });
  if (submission.phone) rows.push({ label: 'Phone', value: submission.phone });
  if (isPrayer && submission.pray_for?.length) rows.push({ label: 'Categories', value: submission.pray_for.join(', ') });
  rows.push({ label: isPrayer ? 'Request' : 'Testimony', value: snippet || '—' });

  return sendNotificationEmail(env, {
    subject: isPrayer ? `New Prayer Request from ${name}` : `New Testimony from ${name}`,
    heading: isPrayer ? 'New Prayer Request' : 'New Testimony',
    intro: `${name} just submitted ${isPrayer ? 'a prayer request' : 'a testimony'} on the website.`,
    rows,
    ctaLabel: 'View in Admin Portal',
    ctaUrl: `https://clgcville.org/admin-portal/`,
  });
}

function sendSubmitterConfirmation(env, collection, submission) {
  const isPrayer = collection === 'prayer_requests';
  const name = submission.name?.trim() || 'Friend';
  const bodyText = (isPrayer ? submission.request : submission.testimony) || '';
  const snippet = bodyText.length > 300 ? bodyText.slice(0, 300) + '…' : bodyText;

  const rows = [
    { label: isPrayer ? 'Your Request' : 'Your Testimony', value: snippet || '—' },
  ];
  if (isPrayer && submission.pray_for?.length) {
    rows.push({ label: 'Categories', value: submission.pray_for.join(', ') });
  }

  return sendNotificationEmail(env, {
    to: submission.email,
    subject: isPrayer ? 'We Received Your Prayer Request' : 'Thank You for Sharing Your Testimony',
    heading: isPrayer ? 'Your Prayer Request Was Received' : 'Your Testimony Was Received',
    intro: isPrayer
      ? `Thank you, ${name}. Your request has been received in confidence, and our prayer team will be in agreement with you.`
      : `Thank you, ${name}! We're so grateful you shared what God has done in your life. Our team will follow up with you personally.`,
    rows,
    ctaLabel: 'Visit Our Website',
    ctaUrl: 'https://clgcville.org',
  });
}
