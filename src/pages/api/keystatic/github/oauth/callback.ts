// Custom Keystatic OAuth callback - handles non-expiring GitHub tokens
import type { APIRoute } from 'astro';

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const enc = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  const binString = Array.from(bytes, (b) => String.fromCodePoint(b)).join('');
  return btoa(binString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(secret), 'HKDF', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: salt as unknown as ArrayBuffer, info: new Uint8Array(0) },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptValue(value: string, secret: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(secret, salt);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(value));
  const full = new Uint8Array(SALT_LENGTH + IV_LENGTH + encrypted.byteLength);
  full.set(salt);
  full.set(iv, SALT_LENGTH);
  full.set(new Uint8Array(encrypted), SALT_LENGTH + IV_LENGTH);
  return base64UrlEncode(full);
}

function makeCookie(
  name: string, value: string, maxAge: number,
  { httpOnly = false, secure = true } = {}
): string {
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  return [
    `${name}=${value}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    `Expires=${expires}`,
    'SameSite=Lax',
    ...(secure ? ['Secure'] : []),
    ...(httpOnly ? ['HttpOnly'] : []),
  ].join('; ');
}

export const GET: APIRoute = async ({ request }) => {
  const reqUrl = new URL(request.url);
  const code = reqUrl.searchParams.get('code');

  const clientId = process.env.KEYSTATIC_GITHUB_CLIENT_ID!;
  const clientSecret = process.env.KEYSTATIC_GITHUB_CLIENT_SECRET!;
  const ksSecret = process.env.KEYSTATIC_SECRET!;
  const isProd = process.env.NODE_ENV === 'production';

  if (!code) {
    return new Response('Bad Request', { status: 400 });
  }

  // Exchange code for token
  const tokenUrl = new URL('https://github.com/login/oauth/access_token');
  tokenUrl.searchParams.set('client_id', clientId);
  tokenUrl.searchParams.set('client_secret', clientSecret);
  tokenUrl.searchParams.set('code', code);
  tokenUrl.searchParams.set('redirect_uri', `${reqUrl.origin}/api/keystatic/github/oauth/callback`);

  const tokenRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });

  const tokenBody = await tokenRes.json() as Record<string, unknown>;

  if (!tokenRes.ok || tokenBody.error || !tokenBody.access_token) {
    return new Response('Authorization failed', { status: 401 });
  }

  const accessToken = tokenBody.access_token as string;
  // For non-expiring tokens, store access_token as "refresh token"
  const refreshToken = (tokenBody.refresh_token as string | undefined) ?? accessToken;
  const expiresIn = (tokenBody.expires_in as number | undefined) ?? 28800;
  const refreshExpiresIn = (tokenBody.refresh_token_expires_in as number | undefined) ?? 15897600;

  const encryptedRefresh = await encryptValue(refreshToken, ksSecret);

  const headers = new Headers();
  headers.append('Location', '/keystatic');
  headers.append('Set-Cookie', makeCookie('keystatic-gh-access-token', accessToken, expiresIn, { secure: isProd }));
  headers.append('Set-Cookie', makeCookie('keystatic-gh-refresh-token', encryptedRefresh, refreshExpiresIn, { httpOnly: true, secure: isProd }));

  return new Response(null, { status: 307, headers });
};
