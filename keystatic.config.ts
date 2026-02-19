// keystatic.config.ts
import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github', // Cambiamos 'local' por 'github'
    repo: {
      owner: 'tomasmartinez564', // Tu usuario de GitHub
      name: 'Nexonomic',         // El nombre exacto de tu repositorio
    },
  },
  collections: {
    noticias: collection({
      label: 'Noticias',
      slugField: 'title',
      path: 'src/content/noticias/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        date: fields.date({ label: 'Fecha de publicación' }),
        excerpt: fields.text({ label: 'Resumen', multiline: true }),
        category: fields.select({
          label: 'Categoría',
          options: [
            { label: 'Economía', value: 'Economía' },
            { label: 'Filosofía', value: 'Filosofía' },
            { label: 'Tecnología', value: 'Tecnología' },
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