import { useEffect, useState } from 'react';

export type QuoteItem = {
	slug: string;
	author: string;
	role: string;
	text: string;
};

function shuffle<T>(items: T[]): T[] {
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

/** Primer render idéntico en servidor y cliente (evita error de hidratación). El azar solo en el cliente. */
function stableFirstSix(quotes: QuoteItem[]): QuoteItem[] {
	return quotes.slice(0, Math.min(6, quotes.length));
}

export default function QuotesCarousel({ quotes }: { quotes: QuoteItem[] }) {
	const [picked, setPicked] = useState<QuoteItem[]>(() => stableFirstSix(quotes));
	const [page, setPage] = useState(0);

	const quotesKey = quotes.map((q) => q.slug).join('|');

	useEffect(() => {
		if (!quotes.length) {
			setPicked([]);
			setPage(0);
			return;
		}
		setPicked(shuffle(quotes).slice(0, Math.min(6, quotes.length)));
		setPage(0);
		// quotesKey evita re-ejecutar por nueva referencia del array; quotes viene del cierre del render actual.
	}, [quotesKey]);

	const pageCount = Math.max(1, Math.ceil(picked.length / 3));
	const slice = picked.slice(page * 3, page * 3 + 3);

	if (!quotes.length) {
		return <p className="text-center text-gray-500 font-sans py-8">No hay citas publicadas aún.</p>;
	}

	return (
		<div className="w-full">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
				<a
					href="/citas"
					className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-sans order-2 sm:order-1"
				>
					Ver todas las citas
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
						<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
					</svg>
				</a>
				{pageCount > 1 ? (
					<div className="flex items-center justify-center sm:justify-end gap-2 order-1 sm:order-2">
						<button
							type="button"
							className="px-4 py-2 rounded-full border border-white/15 text-sm font-sans text-gray-300 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
							disabled={page <= 0}
							onClick={() => setPage((p) => Math.max(0, p - 1))}
							aria-label="Citas anteriores"
						>
							←
						</button>
						<span className="text-xs text-gray-500 font-sans tabular-nums px-2">
							{page + 1} / {pageCount}
						</span>
						<button
							type="button"
							className="px-4 py-2 rounded-full border border-white/15 text-sm font-sans text-gray-300 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
							disabled={page >= pageCount - 1}
							onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
							aria-label="Más citas"
						>
							→
						</button>
					</div>
				) : null}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
				{slice.map((quote) => (
					<div
						key={quote.slug}
						className="group relative p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-accent/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl shadow-black/20"
					>
						<span className="absolute -top-4 left-6 text-6xl text-accent/20 font-serif group-hover:text-accent/40 transition-colors" aria-hidden>
							&quot;
						</span>
						<blockquote className="relative z-10">
							<p className="font-serif text-xl text-gray-200 italic leading-relaxed mb-6 group-hover:text-white transition-colors">
								&quot;{quote.text}&quot;
							</p>
							<footer className="flex flex-col">
								<cite className="font-sans text-accent font-bold not-italic tracking-wider uppercase text-xs">{quote.author}</cite>
								<span className="text-gray-500 text-xs mt-1 font-sans">{quote.role}</span>
							</footer>
						</blockquote>
					</div>
				))}
			</div>
		</div>
	);
}
