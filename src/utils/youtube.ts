/**
 * Extrae el ID de un video de YouTube desde URL completa o ID puro.
 * Soporta watch?v=, youtu.be/, y parámetros extra (?t=, &t=, etc.).
 */
export function extractYoutubeId(input: string): string | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;

  // Ya es solo el ID (11 chars típicos: letras, números, _, -)
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
    return raw;
  }

  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();

    // youtube.com/watch?v=ID
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      // youtube.com/embed/ID o /shorts/ID o /live/ID
      const pathMatch = url.pathname.match(/\/(?:embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/);
      if (pathMatch) return pathMatch[1];
    }

    // youtu.be/ID
    if (host === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '').split('/')[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
  } catch {
    // no es URL válida; seguir a fallback
  }

  // Fallback: buscar v=ID en el string
  const vMatch = raw.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vMatch) return vMatch[1];

  // Fallback: youtu.be/ID sin protocolo parseable
  const shortMatch = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  console.warn(`[youtube] No se pudo extraer ID de YouTube desde: "${raw}"`);
  return null;
}
