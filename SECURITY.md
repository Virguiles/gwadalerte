# Security Policy

## Reporting a vulnerability

Please report security issues privately, via
[GitHub's private vulnerability reporting](https://github.com/Virguiles/gwadalerte/security/advisories/new),
rather than by opening a public issue.

Expect an acknowledgement within a few days. This is a volunteer project, so
please be patient with the fix timeline.

## Scope

Gwad'Alerte holds no user accounts and no personal data. It reads four public,
unauthenticated upstream sources and renders them. The realistic risk surface
is therefore:

- the API routes under `app/api/`, which proxy and cache upstream responses;
- the cache layer (`lib/cache.ts`), if it could be poisoned or made to leak
  across requests;
- injection through upstream data rendered into the page.

Reports about the upstream providers themselves (Météo-France, Gwad'Air,
Open-Meteo, Orisk) should go to those providers.

## Data sources and disclaimer

Gwad'Alerte re-publishes public data. It is not an official source. In an
emergency, the instructions of the Préfecture de la Guadeloupe and of
Météo-France take precedence over anything shown here.
