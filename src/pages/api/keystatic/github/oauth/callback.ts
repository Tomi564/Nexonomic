// TEMPORAL - intercepta el callback de Keystatic para diagnóstico
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const reqUrl = new URL(request.url);
  const code = reqUrl.searchParams.get('code');
  const state = reqUrl.searchParams.get('state');

  const clientId = process.env.KEYSTATIC_GITHUB_CLIENT_ID;
  const clientSecret = process.env.KEYSTATIC_GITHUB_CLIENT_SECRET;

  if (!code) {
    return new Response(JSON.stringify({ error: 'No code in callback' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL('https://github.com/login/oauth/access_token');
  url.searchParams.set('client_id', clientId!);
  url.searchParams.set('client_secret', clientSecret!);
  url.searchParams.set('code', code);
  url.searchParams.set('redirect_uri', `${reqUrl.origin}/api/keystatic/github/oauth/callback`);

  const tokenRes = await fetch(url, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });

  const tokenBody = await tokenRes.json();

  return new Response(
    JSON.stringify({
      receivedCode: code.substring(0, 8) + '...',
      receivedState: state,
      tokenExchange: {
        httpStatus: tokenRes.status,
        httpOk: tokenRes.ok,
        body: tokenBody,
      },
    }, null, 2),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
