# Gwad'Alerte

**A citizen dashboard for Guadeloupe — air quality, weather warnings and water
rota, on one map.**

[gwadalerte.com](https://gwadalerte.com) · [Accessibility audit](docs/accessibility-audit.md) · Storybook: `npm run storybook`

[![CI](https://github.com/Virguiles/gwadalerte/actions/workflows/ci.yml/badge.svg)](https://github.com/Virguiles/gwadalerte/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG_2.2-AA-0b7285.svg)](docs/accessibility-audit.md)

---

## What it is

Four public data sources about Guadeloupe exist, and each lives on its own
website, in its own vocabulary, behind its own map. Gwad'Alerte puts them on a
single map of Guadeloupe's 32 communes (plus Saint-Martin): pick one, get its air
quality index, its weather, its Météo-France warning level and whether its
water is scheduled to be cut today.

It is built for the way the information is actually needed — on a phone, in
daylight, quickly, often during a weather event.

## Why it might interest you as a developer

The interesting part is not the dashboard; it is the **design system underneath
it**, and specifically the fact that its accessibility is *argued and tested*
rather than asserted.

- **One source of colour.** Every colour in the product is a token in
  [`app/tokens.css`](app/tokens.css) or
  [`app/(dashboard)/lib/palette.ts`](app/\(dashboard\)/lib/palette.ts). No
  literal `#hex` exists in any component. The token file explains *why* each
  value is what it is — including the ones that had to change.
- **Contrast is a unit test.** [`contrast.test.ts`](app/\(dashboard\)/lib/contrast.test.ts)
  parses `tokens.css`, resolves the `var()` chains, composites the alpha layers
  and asserts a WCAG ratio for every semantic scale in both themes — 40
  assertions. It also re-derives the ratios written in the audit
  (`7.87 / 10.48 / 4.94 / 3.58` for dark ATMO 1/3/5/6), so the numbers in the
  comments cannot quietly go stale. A colour that drops below its threshold
  fails the build.
- **Every story is scanned by axe-core** in CI, in both light and dark themes.
- **The audit is written down.** [`docs/accessibility-audit.md`](docs/accessibility-audit.md)
  records 4 critical, 20 major and 17 minor findings against WCAG 2.2 AA, how
  each was fixed, the measured ratios after the fix, and the two remaining gaps
  with the reasoning for accepting them.
- **Colour never carries information alone.** Communes without a measurement
  are marked by a dashed outline as well as a neutral fill, because no single
  flat colour can hold 3:1 against both the stage and its neighbouring fills.

Design decisions are documented as prose comments next to the code that
implements them, in French. If you want a sense of the reasoning, read
[`app/tokens.css`](app/tokens.css) top to bottom — it is short, and it is the
spine of the project.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, React 19, React Compiler) |
| Language | TypeScript, strict |
| Styling | CSS custom properties + Tailwind CSS 4 |
| Components | Storybook 10 with `@storybook/addon-a11y` |
| Map | Inline SVG, projected with `d3-geo` |
| Tests | Vitest — unit suite in Node, story suite in Chromium with axe-core |
| Cache | Vercel KV, falling back to an in-process `Map` |
| Hosting | Vercel |

## Data sources

| Source | Provides | Auth |
|---|---|---|
| [Gwad'Air](https://www.gwadair.gp/) (ArcGIS) | ATMO index per commune | none |
| [Open-Meteo](https://open-meteo.com/) | current weather and 3-day forecast | none |
| [Météo-France DPVigilance](https://portail-api.meteofrance.fr/) | warning levels (incl. cyclone) | OAuth2 |
| [Orisk](https://orisk.app/) | water rota, with an SMGEAG fallback | none |

Gwad'Alerte republishes public data and is **not an official source**. During
an emergency, the Préfecture de la Guadeloupe and Météo-France take precedence.

## Running it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. **No API key is required** — three of the four
sources are unauthenticated, and the fourth degrades to a green warning level
when credentials are absent. Copy [`.env.example`](.env.example) to
`.env.local` if you want real Météo-France warnings.

### Storybook

```bash
npm run storybook
```

Open <http://localhost:6006>. The **Foundations** section renders the token
files directly, so the palette documentation cannot drift from the palette.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | unit tests (Node) |
| `npm run test:a11y` | every story rendered in Chromium, then axe-core |
| `npm run test:all` | both suites |
| `npm run storybook` | Storybook on :6006 |
| `npm run build-storybook` | static Storybook build |

## Project layout

```
app/
  tokens.css              the palette — single source of colour
  (dashboard)/            the product: one page, one map
    lib/palette.ts        ATMO and vigilance scales
    lib/contrast.ts       WCAG ratio maths, asserted over tokens.css
    lib/model.ts          merges the four sources into one commune record
    components/           MapStage, SidePanel, CommuneDetail, Readout…
  (legal)/                legal pages, credits
  api/                    five cached route handlers proxying the sources
  components/             cross-cutting: ThemeToggle, CookieBanner, HelpButton
lib/                      API clients, cache, WMO weather codes
.storybook/               Storybook config, a11y addon, theme decorator
  docs/Couleur…           the palette, measured live in the browser
docs/                     accessibility audit, architecture, deployment
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Accessibility findings are the most
welcome kind of issue. Security issues go through [SECURITY.md](SECURITY.md),
not the public tracker.

## Licence

[MIT](LICENSE) © Virgile Popote

Guadeloupe commune geometry comes from
the [API Découpage administratif](https://geo.api.gouv.fr/) (IGN, Admin Express) under
[Licence Ouverte 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/).
