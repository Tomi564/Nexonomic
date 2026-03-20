import rss from '@astrojs/rss';
import { getNoticias } from '../utils/noticias';

export async function GET() {
  const noticias = await getNoticias();

  return rss({
    title: 'Nexonomic — Economía y Filosofía',
    description: 'Un espacio de reflexión crítica donde la teoría económica se encuentra con los fundamentos filosóficos de nuestra sociedad.',
    site: 'https://nexonomic.netlify.app',
    items: noticias.map(n => ({
      title: n.data.title ?? '',
      description: n.data.excerpt ?? '',
      pubDate: n.data.date ? new Date(n.data.date) : new Date(),
      link: `/blog/${n.slug}`,
    })),
  });
}
