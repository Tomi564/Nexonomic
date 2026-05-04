import { marked } from 'marked';

marked.setOptions({
	gfm: true,
	breaks: true,
});

/** Limpia artefactos de pegado (Word/Edge) y caracteres invisibles antes de parsear Markdown. */
export function cleanArticleBodySource(raw: string): string {
	let s = raw.replace(/\r\n/g, '\n');
	s = s.replace(/<!--\s*StartFragment\s*-->/gi, '');
	s = s.replace(/<!--\s*EndFragment\s*-->/gi, '');
	s = s.replace(/(?:^|\n)\s*StartFragment\s*(?:\n|$)/gi, '\n');
	s = s.replace(/(?:^|\n)\s*EndFragment\s*(?:\n|$)/gi, '\n');
	s = s.replace(/\u200b/g, '');
	return s.trim();
}

/** Convierte el cuerpo de la noticia (.mdoc tras el frontmatter) a HTML seguro para `set:html`. */
export function articleBodyMarkdownToHtml(raw: string): string {
	const cleaned = cleanArticleBodySource(raw);
	const out = marked.parse(cleaned, { async: false });
	if (typeof out !== 'string') {
		throw new Error('articleBodyMarkdownToHtml: se esperaba salida síncrona');
	}
	return out;
}
