export async function onRequest(context) {
  const env = context.env;

  return new Response(JSON.stringify({
    github_token_exists: !!env.GITHUB_TOKEN,
    github_token_length: env.GITHUB_TOKEN ? env.GITHUB_TOKEN.length : 0,
    github_token_start: env.GITHUB_TOKEN ? env.GITHUB_TOKEN.substring(0, 10) : null,
    all_env_keys: Object.keys(env),
    timestamp: new Date().toISOString()
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
