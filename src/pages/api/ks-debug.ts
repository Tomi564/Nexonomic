// TEMPORAL - eliminar después del diagnóstico
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const clientId = process.env.KEYSTATIC_GITHUB_CLIENT_ID;
  const clientSecret = process.env.KEYSTATIC_GITHUB_CLIENT_SECRET;
  const secret = process.env.KEYSTATIC_SECRET;

  const envStatus = {
    KEYSTATIC_GITHUB_CLIENT_ID: clientId ? `${clientId.substring(0, 8)}... (len: ${clientId.length})` : 'NOT SET',
    KEYSTATIC_GITHUB_CLIENT_SECRET: clientSecret ? `set (len: ${clientSecret.length})` : 'NOT SET',
    KEYSTATIC_SECRET: secret ? `set (len: ${secret.length})` : 'NOT SET',
  };

  let tokenExchangeResult = null;

  if (clientId && clientSecret) {
    const url = new URL('https://github.com/login/oauth/access_token');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('client_secret', clientSecret);
    url.searchParams.set('code', 'intentionally_invalid_code');

    const res = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });

    tokenExchangeResult = {
      httpStatus: res.status,
      httpOk: res.ok,
      body: await res.json(),
    };
  }

  return new Response(
    JSON.stringify({ envStatus, tokenExchangeResult }, null, 2),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
