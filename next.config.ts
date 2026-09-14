import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Plus de `images.remotePatterns` : les photos d'illustration venaient du
  // fond animé de l'ancienne page d'accueil, supprimée. Le site ne charge
  // aujourd'hui aucune image distante.
  /**
   * En-têtes de sécurité. Ils vivaient dans `netlify.toml`, que Vercel ne lit
   * pas : le site tournait donc sans aucun d'entre eux. Rapatriés ici, où ils
   * s'appliquent réellement.
   *
   * `X-XSS-Protection` n'est pas repris : le filtre XSS des navigateurs a été
   * retiré (Chrome 78, Edge), et l'activer là où il subsiste a introduit des
   * failles par le passé. La CSP est le remplacement, traitée à part.
   *
   * Les en-têtes de cache de `netlify.toml` ne sont pas repris non plus :
   * Vercel pose déjà `immutable` sur `/_next/static`, et les routes API
   * décident elles-mêmes de leur fraîcheur.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          /*
           * Origines vérifiées dans le code, pas reprises de l'ancienne
           * configuration : le navigateur n'appelle que les routes API locales,
           * `geo.api.gouv.fr`, repli du contour des communes
           * (`(dashboard)/lib/model.ts`), et le beacon Cloudflare Web Analytics
           * (`static.cloudflareinsights.com` pour le script, `cloudflareinsights.com`
           * pour l'envoi des mesures — sans cookie, voir CookieBanner). Open-Meteo,
           * Météo-France et ArcGIS sont passés côté serveur — les lister ici ne
           * protégerait rien. `googletagmanager` disparaît avec Google Analytics,
           * retiré.
           *
           * `'unsafe-inline'` sur `script-src` reste nécessaire : Next et
           * next-themes injectent des scripts en ligne, et le nonce qui
           * permettrait de s'en passer imposerait un middleware, donc la perte
           * du rendu statique. La CSP vaut ici surtout pour `connect-src`,
           * `form-action` et `frame-ancestors`.
           */
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self' https://geo.api.gouv.fr https://cloudflareinsights.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  /**
   * Les trois pages thématiques et l'ancienne adresse du tableau de bord
   * renvoient vers l'accueil, qui les remplace toutes. Redirections permanentes
   * pour transmettre le référencement acquis : ces URL sont indexées et
   * partagées (Facebook, WhatsApp) depuis des mois.
   */
  async redirects() {
    return [
      { source: '/dashboard', destination: '/', permanent: true },
      { source: '/qualite-air', destination: '/', permanent: true },
      // `temperature` n'est pas une couche : `LAYER_BY_PARAM` (DashboardClient)
      // ne connaît que `air` et `eau`, le paramètre était donc ignoré puis
      // effacé de l'URL. Tant qu'il n'y a pas de couche température, la
      // redirection va simplement à l'accueil.
      { source: '/meteo', destination: '/', permanent: true },
      { source: '/tours-deau', destination: '/?vue=eau', permanent: true },
    ];
  },
};

export default nextConfig;
