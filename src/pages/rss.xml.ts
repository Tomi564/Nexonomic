import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getNoticias } from '../utils/noticias';

export const GET: APIRoute = async ({ site }) => {
  const noticias = await getNoticias();
  const siteUrl = site?.href ?? 'https://nexonomic.com';

  return rss({
    title: 'Nexonomic — Economía y Filosofía',
    description: 'Un espacio de reflexión crítica donde la teoría económica se encuentra con los fundamentos filosóficos de nuestra sociedad.',
    site: siteUrl,
    items: noticias.map(n => ({
      title: n.data.title ?? '',
      description: n.data.excerpt ?? '',
      pubDate: n.data.date ? new Date(n.data.date) : new Date(),
      link: `/blog/${n.slug}`,
    })),
  });
};

