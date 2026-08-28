/**
 * Shared email notifications via Resend (https://resend.com).
 *
 * Required env var (Cloudflare Pages → Settings → Environment Variables):
 *   RESEND_API_KEY   — API key from your Resend account
 * Optional:
 *   RESEND_FROM_EMAIL — override the sender address below
 *
 * The default sender is noreply@clgcville.org, which requires clgcville.org
 * to be a verified sending domain in Resend (Domains → Add Domain → add the
 * DNS records it gives you). Until that verification is complete, sends
 * will fail — set RESEND_FROM_EMAIL to Resend's sandbox address
 * ("Church Of The Living God <onboarding@resend.dev>") as a temporary
 * fallback if you need email working before verification finishes. Note
 * the sandbox sender can only deliver to the Resend account's own email,
 * so submitter confirmations need the verified domain regardless.
 *
 * All failures are swallowed and logged — a broken/missing email config
 * must never block a save or a public form submission.
 */

const NOTIFY_TO = 'clgcville2014@gmail.com';
const DEFAULT_FROM = 'Church Of The Living God <noreply@clgcville.org>';
const SITE_URL = 'https://clgcville.org';

export async function sendNotificationEmail(env, { to, subject, heading, intro, rows = [], ctaLabel, ctaUrl }) {
  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email notification');
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL || DEFAULT_FROM,
        to: [to || NOTIFY_TO],
        subject,
        html: buildEmailHtml({ heading, intro, rows, ctaLabel, ctaUrl }),
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      console.error('Resend API error:', res.status, err);
    }
  } catch (err) {
    console.error('Failed to send notification email:', err.message);
  }
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildEmailHtml({ heading, intro, rows, ctaLabel, ctaUrl }) {
  const rowsHtml = rows.map(({ label, value }) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #E9E4D8;font:13px/1.4 'Inter',Helvetica,Arial,sans-serif;color:#8A8375;width:150px;vertical-align:top;">${esc(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #E9E4D8;font:14px/1.5 'Inter',Helvetica,Arial,sans-serif;color:#1A1A1A;vertical-align:top;">${esc(value)}</td>
    </tr>`).join('');

  const ctaHtml = ctaUrl ? `
    <tr>
      <td style="padding:28px 0 4px;" align="left">
        <a href="${esc(ctaUrl)}" target="_blank"
           style="display:inline-block;background:#C9A84C;color:#0D1F17;text-decoration:none;
                  font:700 13px/1 'Inter',Helvetica,Arial,sans-serif;letter-spacing:0.3px;
                  padding:14px 26px;border-radius:8px;">
          ${esc(ctaLabel || 'View in Admin Portal')} &rarr;
        </a>
      </td>
    </tr>` : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0"
               style="max-width:560px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(13,31,23,0.12);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0D1F17 0%,#1B4332 100%);padding:32px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr><td style="width:34px;height:34px;background:#C9A84C;border-radius:9px;text-align:center;vertical-align:middle;font-size:16px;line-height:34px;">&#9766;</td></tr>
                    </table>
                  </td>
                  <td style="padding-left:12px;">
                    <div style="font:700 15px/1.2 'Playfair Display',Georgia,serif;color:#FFFFFF;">Church Of The Living God</div>
                    <div style="font:600 10.5px/1.4 'Inter',Helvetica,Arial,sans-serif;color:#C9A84C;letter-spacing:0.8px;text-transform:uppercase;margin-top:2px;">Admin Notification</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 8px;">
              <div style="font:700 22px/1.3 'Playfair Display',Georgia,serif;color:#1B4332;">${esc(heading)}</div>
              <div style="width:44px;height:3px;background:#C9A84C;border-radius:2px;margin:12px 0 18px;"></div>
              ${intro ? `<div style="font:14px/1.6 'Inter',Helvetica,Arial,sans-serif;color:#4A4A45;margin-bottom:6px;">${esc(intro)}</div>` : ''}
            </td>
          </tr>

          ${rows.length ? `
          <tr>
            <td style="padding:0 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${rowsHtml}
              </table>
            </td>
          </tr>` : ''}

          <tr>
            <td style="padding:0 36px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${ctaHtml}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F5F0E8;padding:20px 36px;border-top:1px solid #E9E4D8;">
              <div style="font:12px/1.6 'Inter',Helvetica,Arial,sans-serif;color:#8A8375;">
                Church Of The Living God &middot; 2130 Berkmar Drive, Charlottesville, VA 22901<br>
                This is an automated notification from <a href="${SITE_URL}" style="color:#1B4332;">clgcville.org</a>.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
