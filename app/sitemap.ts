import { MetadataRoute } from 'next'

/**
 * Trois entrées seulement : le tableau de bord et les deux pages légales.
 *
 * /meteo, /qualite-air et /tours-deau ne sont plus des pages mais des
 * redirections vers l'accueil (voir next.config.ts) — les déclarer ici
 * demanderait à Google d'indexer des URL qui ne répondent plus 200.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gwadalerte.com'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/credits`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]
}
