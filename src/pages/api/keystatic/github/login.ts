import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const reqUrl = new URL(request.url);
  const from = reqUrl.searchParams.get('from') ?? '/';

  const clientId = process.env.KEYSTATIC_GITHUB_CLIENT_ID!;
  const isProd = process.env.NODE_ENV === 'production';

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', `${reqUrl.origin}/api/keystatic/github/oauth/callback`);
  url.searchParams.set('scope', 'public_repo');

  if (from && from !== '/') {
    const state = Array.from(crypto.getRandomValues(new Uint8Array(10)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    url.searchParams.set('state', state);

    const cookieOptions = [
      `ks-${state}=${encodeURIComponent(from)}`,
      'Path=/',
      `Max-Age=${60 * 60 * 24}`,
      'SameSite=Lax',
      'HttpOnly',
      ...(isProd ? ['Secure'] : []),
    ].join('; ');

    return new Response(null, {
      status: 307,
      headers: {
        Location: url.toString(),
        'Set-Cookie': cookieOptions,
      },
    });
  }

  return new Response(null, {
    status: 307,
    headers: { Location: url.toString() },
  });
};
