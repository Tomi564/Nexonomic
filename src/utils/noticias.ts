import yaml from 'js-yaml';

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return '';
  return new Date(year, month - 1, day).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function coerceFrontmatterValues(obj: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val instanceof Date) {
      out[key] = val.toISOString().slice(0, 10);
    } else if (typeof val === 'string') {
      out[key] = val.trim();
    } else if (val === null || val === undefined) {
      out[key] = '';
    } else {
      out[key] = String(val);
    }
  }
  return out;
}

/** Parsea YAML real del frontmatter (.mdoc de Keystatic usa bloques `>-` para imagen, etc.) */
export function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {} as Record<string, string>, body: raw };

  const frontmatterStr = match[1];
  const body = raw.slice(match[0].length).trim();

  try {
    const parsed = yaml.load(frontmatterStr);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { data: coerceFrontmatterValues(parsed as Record<string, unknown>), body };
    }
  } catch {
    // fallback abajo
  }

  const data: Record<string, string> = {};
  for (const line of frontmatterStr.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    data[key] = value;
  }

  return { data, body };
}

/** URLs públicas para <img> / og (Keystatic suele guardar `/images/...`) */
export function normalizePublicUrl(href: string | undefined): string {
  if (!href) return '';
  const t = href.trim();
  if (!t) return '';
  if (t.startsWith('http://') || t.startsWith('https://')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

export async function getNoticias() {
  const files = import.meta.glob('../content/noticias/*.mdoc', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

  return Object.entries(files).map(([path, raw]) => {
    const slug = path.split('/').pop()!.replace('.mdoc', '');
    const { data, body } = parseFrontmatter(raw);
    return { slug, data, body };
  });
}
