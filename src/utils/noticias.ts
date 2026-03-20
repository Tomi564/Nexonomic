export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Parses YAML frontmatter from .mdoc file content
export function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {}, body: raw };

  const frontmatterStr = match[1];
  const body = raw.slice(match[0].length).trim();

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

export async function getNoticias() {
  const files = import.meta.glob('../content/noticias/*.mdoc', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

  return Object.entries(files).map(([path, raw]) => {
    const slug = path.split('/').pop()!.replace('.mdoc', '');
    const { data, body } = parseFrontmatter(raw);
    return { slug, data, body };
  });
}
