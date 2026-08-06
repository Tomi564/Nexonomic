import { formatDate, normalizePublicUrl, parseFrontmatter } from './noticias';
import { extractYoutubeId } from './youtube';

export { formatDate, normalizePublicUrl, extractYoutubeId };

export type ProgramaEntry = {
  slug: string;
  data: Record<string, string>;
  body: string;
};

/** Lee youtubeUrl (o youtubeId legacy) y resuelve el ID del video. */
export function resolveProgramaYoutubeId(data: Record<string, string>): string | null {
  const raw = (data.youtubeUrl ?? data.youtubeId ?? '').trim();
  if (!raw) return null;
  return extractYoutubeId(raw);
}

/**
 * URL del thumbnail de YouTube (prioriza maxres).
 * Si el video no tiene maxres, YouTube sirve un placeholder 120×90;
 * ContentCard detecta eso y hace fallback a hqdefault.
 */
export function youtubeThumbnailUrl(youtubeUrlOrId: string | undefined): string {
  const id = extractYoutubeId(youtubeUrlOrId ?? '');
  if (!id) return '';
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

/** Fallback de calidad media (casi siempre disponible). */
export function youtubeThumbnailUrlHq(youtubeUrlOrId: string | undefined): string {
  const id = extractYoutubeId(youtubeUrlOrId ?? '');
  if (!id) return '';
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export async function getProgramas(): Promise<ProgramaEntry[]> {
  const files = import.meta.glob('../content/programas/*.mdoc', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  return Object.entries(files).map(([path, raw]) => {
    const slug = path.split('/').pop()!.replace('.mdoc', '');
    const { data, body } = parseFrontmatter(raw);
    return { slug, data, body };
  });
}

/** Orden: episodeNumber desc, luego date desc. */
export function sortProgramasRecentFirst(programas: ProgramaEntry[]): ProgramaEntry[] {
  return [...programas].sort((a, b) => {
    const epA = Number(a.data.episodeNumber) || 0;
    const epB = Number(b.data.episodeNumber) || 0;
    if (epB !== epA) return epB - epA;
    return (b.data.date ?? '').localeCompare(a.data.date ?? '');
  });
}
