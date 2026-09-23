# Contributing

Thanks for taking an interest in Gwad'Alerte. This is a small public-service
dashboard for Guadeloupe, and contributions are welcome — bug reports and
accessibility findings most of all.

**Language note.** Issues and pull requests are welcome in French or English.
The codebase comments are in French, because the domain (communes, tours d'eau,
vigilance Météo-France) is French. Keep new comments in French for consistency.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run storybook    # http://localhost:6006
```

No API keys are needed for development: every upstream source
(Open-Meteo, Gwad'Air, Orisk) is public and unauthenticated. See
[`.env.example`](.env.example) for the optional variables.

## Before you open a pull request

```bash
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # unit tests (Node)
npm run test:a11y    # every story in Chromium, then axe-core
npm run build        # production build
```

CI runs all of these. A pull request that fails any of them will not be merged.

## What we care about

**Accessibility is not a nice-to-have here.** The project targets WCAG 2.2
level AA, and the reasoning behind every colour and every control is written
down in [`docs/accessibility-audit.md`](docs/accessibility-audit.md). Two rules
follow from it:

1. **No literal colour outside the token files.** Colours live in
   [`app/tokens.css`](app/tokens.css) and
   [`app/(dashboard)/lib/palette.ts`](app/\(dashboard\)/lib/palette.ts), and
   nowhere else. A `#hex` or a `slate-600` in a component is a bug.
2. **Contrast is asserted, not assumed.** New semantic colours need a matching
   assertion in [`app/(dashboard)/lib/contrast.test.ts`](app/\(dashboard\)/lib/contrast.test.ts):
   4.5:1 for text, 3:1 for large text and for non-text elements (WCAG 1.4.11).
   A colour that cannot meet its threshold may still ship, but only as an
   explicit exception carrying its reasoning — see `--water-0`, which says
   « no cuts » and is therefore a neutral state rather than information to
   distinguish. Silent exceptions are the thing this setup exists to prevent.

Every component that can be rendered in isolation should have a story, and
every story is checked with axe-core in CI.

## Commit messages

Written in French, imperative mood, describing the effect rather than the edit:

```
Affiche le statut du jour des tours d'eau et date chaque commune selon sa source
```

not `fix: update water cuts`.

## Reporting a security issue

Please do not open a public issue. See [`SECURITY.md`](SECURITY.md).
