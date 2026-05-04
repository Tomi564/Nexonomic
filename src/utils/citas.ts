const yamlFiles = import.meta.glob('../content/citas/*.yaml', {
	query: '?raw',
	import: 'default',
	eager: true,
}) as Record<string, string>;

export function parseYamlFields(raw: string): Record<string, string> {
	const lines = raw.split('\n');
	const result: Record<string, string> = {};
	let i = 0;
	while (i < lines.length) {
		const line = lines[i];
		const colonIdx = line.indexOf(':');
		if (colonIdx === -1) {
			i++;
			continue;
		}
		const key = line.slice(0, colonIdx).trim();
		const rest = line.slice(colonIdx + 1).trim();
		if (rest === '>-' || rest === '>' || rest === '|' || rest === '|-') {
			let value = '';
			i++;
			while (i < lines.length && (lines[i].startsWith('  ') || lines[i] === '')) {
				const chunk = lines[i].trim();
				if (chunk) value += (value ? ' ' : '') + chunk;
				i++;
			}
			result[key] = value.replace(/!$/, '');
		} else {
			result[key] = rest.replace(/!$/, '');
			i++;
		}
	}
	return result;
}

export type CitaEntry = {
	slug: string;
	author: string;
	role: string;
	text: string;
	fechaPublicacion: string;
};

export function getCitas(): CitaEntry[] {
	return Object.entries(yamlFiles)
		.map(([path, raw]) => {
			const slug = path.split('/').pop()!.replace('.yaml', '');
			const data = parseYamlFields(raw);
			return {
				slug,
				author: data.author ?? '',
				role: data.role ?? '',
				text: data.text ?? '',
				fechaPublicacion: data.fechaPublicacion ?? '',
			};
		})
		.filter((q) => q.text);
}
