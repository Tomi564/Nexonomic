/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'deep-bg': '#050708',      // Fondo Profundo
				'action': '#191ba4',       // Acción/Principal
				'accent': '#3cc2a2',       // Acentos/Hovers
				'muted': '#5b82ad',        // Secundario — links y textos apagados
			},
			fontFamily: {
				'serif': ['"Lora"', 'serif'],       // Títulos y Citas
				'sans': ['"Inter"', 'sans-serif'],  // Texto general
			},
		},
	},
	plugins: [
		typography,
	],
}