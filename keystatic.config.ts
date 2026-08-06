// keystatic.config.ts
import { config, fields, collection } from '@keystatic/core';

const isDev = process.env.NODE_ENV === 'development';

export default config({
  storage: isDev
    ? { kind: 'local' }
    : {
        kind: 'github',
        repo: {
          owner: 'Tomi564',
          name: 'Nexonomic',
        },
      },
  collections: {
    noticias: collection({
      label: 'Noticias',
      slugField: 'title',
      path: 'src/content/noticias/*',
      format: { contentField: 'content' },
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        date: fields.date({ label: 'Fecha de publicación' }),
        excerpt: fields.text({ label: 'Resumen', multiline: true }),
        author: fields.text({
          label: 'Autor',
          description: 'Nombre del autor o equipo (opcional). Aparece junto a fecha y categoría.',
        }),
        category: fields.select({
          label: 'Categoría',
          options: [
            { label: 'Economía', value: 'Economía' },
            { label: 'Investigación', value: 'Investigación' },
            { label: 'Política', value: 'Política' },
            { label: 'Académico', value: 'Académico' },
            { label: 'Microeconomía', value: 'Microeconomía' },
            { label: 'Macroeconomía', value: 'Macroeconomía' },
            { label: 'Política económica', value: 'Política económica' },
            { label: 'Economía política', value: 'Economía política' },
            { label: 'Filosofía', value: 'Filosofía' },
            { label: 'Noticias', value: 'Noticias' },
            { label: 'Comunicación', value: 'Comunicación' },
            { label: 'Institucional', value: 'Institucional' },
            { label: 'Entrevista', value: 'Entrevista' },
            { label: 'Periodismo', value: 'Periodismo' },
          ],
          defaultValue: 'Economía',
        }),
        image: fields.image({
          label: 'Imagen de portada',
          directory: 'public/images/noticias',
          publicPath: '/images/noticias',
        }),
        content: fields.document({
          label: 'Contenido',
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: 'public/images/noticias',
            publicPath: '/images/noticias',
          },
        }),
      },
    }),
    citas: collection({
      label: 'Citas',
      slugField: 'author',
      path: 'src/content/citas/*',
      columns: ['author', 'fechaPublicacion', 'role'],
      schema: {
        author: fields.slug({ name: { label: 'Autor' } }),
        fechaPublicacion: fields.date({
          label: 'Fecha de salida',
          description: 'Para ordenar y reconocer entradas en el panel.',
          validation: { isRequired: false },
        }),
        role: fields.text({ label: 'Cargo / Descripción' }),
        text: fields.text({ label: 'Cita', multiline: true }),
      },
    }),
    programas: collection({
      label: 'Programas',
      slugField: 'title',
      path: 'src/content/programas/*',
      format: { contentField: 'content' },
      columns: ['title', 'date', 'guest'],
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        guest: fields.text({
          label: 'Invitado',
          description: 'Nombre del invitado (requerido).',
        }),
        guestRole: fields.text({
          label: 'Cargo / rol del invitado',
          description: 'Opcional. Aparece junto al nombre en la ficha del episodio.',
        }),
        date: fields.date({ label: 'Fecha de emisión' }),
        excerpt: fields.text({ label: 'Bajada / resumen corto', multiline: true }),
        youtubeUrl: fields.text({
          label: 'Link de YouTube',
          description: 'Pegá la URL completa del video de YouTube (la que te da el botón Compartir)',
        }),
        episodeNumber: fields.integer({
          label: 'Número de episodio',
          validation: { isRequired: true },
        }),
        content: fields.document({
          label: 'Transcripción / resumen extendido',
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: 'public/images/programas',
            publicPath: '/images/programas',
          },
        }),
      },
    }),
    documentos: collection({
      label: 'Documentos',
      slugField: 'title',
      path: 'src/content/documentos/*',
      schema: {
        title: fields.slug({ name: { label: 'Nombre del Documento' } }),
        file: fields.file({
          label: 'Archivo PDF/Doc',
          directory: 'public/files/documentos',
          publicPath: '/files/documentos',
        }),
        description: fields.text({ label: 'Descripción breve', multiline: true }),
      },
    }),
  },
});