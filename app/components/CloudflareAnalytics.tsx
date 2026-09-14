import Script from 'next/script';

/**
 * Cloudflare Web Analytics — sans cookie, aucune empreinte cross-site.
 * Le token identifie le site auprès de Cloudflare, il n'est pas secret : il
 * est envoyé au navigateur de chaque visiteur de toute façon.
 */
const BEACON_TOKEN = '91d39f6c07ec43739af5bce613430383';

export function CloudflareAnalytics() {
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${BEACON_TOKEN}"}`}
      strategy="afterInteractive"
    />
  );
}
