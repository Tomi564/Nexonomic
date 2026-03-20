// Custom Keystatic refresh-token - handles non-expiring GitHub tokens
import type { APIRoute } from 'astro';

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const enc = new TextEncoder();
const dec = new TextDecoder();

function base64UrlDecode(base64: string): Uint8Array {
  const binString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}

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

async function decryptValue(encrypted: string, secret: string): Promise<string> {
  const decoded = base64UrlDecode(encrypted);
  const salt = decoded.slice(0, SALT_LENGTH);
  const key = await deriveKey(secret, salt);
  const iv = decoded.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const value = decoded.slice(SALT_LENGTH + IV_LENGTH);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, value);
  return dec.decode(decrypted);
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

export const POST: APIRoute = async ({ request }) => {
  const ksSecret = process.env.KEYSTATIC_SECRET!;
  const clientId = process.env.KEYSTATIC_GITHUB_CLIENT_ID!;
  const clientSecret = process.env.KEYSTATIC_GITHUB_CLIENT_SECRET!;
  const isProd = process.env.NODE_ENV === 'production';

  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.trim().indexOf('=');
    if (idx === -1) continue;
    const k = decodeURIComponent(part.trim().slice(0, idx));
    const v = decodeURIComponent(part.trim().slice(idx + 1));
    cookies[k] = v;
  }
  const encryptedRefresh = cookies['keystatic-gh-refresh-token'];

  if (!encryptedRefresh) {
    return new Response('Authorization failed', { status: 401 });
  }

  let storedToken: string;
  try {
    storedToken = await decryptValue(encryptedRefresh, ksSecret);
  } catch {
    return new Response('Authorization failed', { status: 401 });
  }

  let accessToken = storedToken;
  let refreshToken = storedToken;
  let expiresIn = 28800;
  let refreshExpiresIn = 15897600;

  // Try using storedToken as a real refresh token first
  if (storedToken.startsWith('ghr_')) {
    const tokenUrl = new URL('https://github.com/login/oauth/access_token');
    tokenUrl.searchParams.set('client_id', clientId);
    tokenUrl.searchParams.set('client_secret', clientSecret);
    tokenUrl.searchParams.set('grant_type', 'refresh_token');
    tokenUrl.searchParams.set('refresh_token', storedToken);

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });

    if (tokenRes.ok) {
      const body = await tokenRes.json() as Record<string, unknown>;
      if (body.access_token) {
        accessToken = body.access_token as string;
        refreshToken = (body.refresh_token as string | undefined) ?? storedToken;
        expiresIn = (body.expires_in as number | undefined) ?? 28800;
        refreshExpiresIn = (body.refresh_token_expires_in as number | undefined) ?? 15897600;
      }
    }
  }
  // If storedToken starts with 'gho_' it's a non-expiring access token — use as-is

  const encryptedNew = await encryptValue(refreshToken, ksSecret);

  const headers = new Headers();
  headers.append('Set-Cookie', makeCookie('keystatic-gh-access-token', accessToken, expiresIn, { secure: isProd }));
  headers.append('Set-Cookie', makeCookie('keystatic-gh-refresh-token', encryptedNew, refreshExpiresIn, { httpOnly: true, secure: isProd }));

  return new Response('', { status: 200, headers });
};
