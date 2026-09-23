# Audit UI / UX / accessibilité — Gwad'Alerte

**Périmètre :** branche `refonte-design-v2`.
**Référentiel :** WCAG 2.2 niveau AA.
**Audit initial :** 4 septembre 2026 — lecture intégrale de `app/globals.css`, `app/(dashboard)/dashboard.css`, des composants du dashboard, des composants transverses, des deux layouts racine et des deux pages légales. Ratios calculés selon la formule WCAG 2.x, avec compositing alpha explicite.
**Révision :** 5 septembre 2026 — après application des corrections. Les ratios de cette révision ne sont plus calculés à la main : ils sont **mesurés dans le navigateur** sur la page rendue, en composant les couleurs effectives telles que Chrome les calcule. La méthode a été validée en retrouvant à l'identique les valeurs du thème sombre de l'audit initial (7,87 / 10,48 / 4,94 / 3,58 pour les indices ATMO 1 / 3 / 5 / 6).

> **La mention « aucune modification n'a été appliquée » de la version initiale n'est plus valable.** Les 4 problèmes critiques, les 20 majeurs et les 17 mineurs ont été traités. Deux écarts subsistent, assumés et argumentés en fin de document.

---

## Constat général — révisé

Le diagnostic d'origine était juste : le thème sombre était solide, et le thème clair — devenu le défaut — n'avait pas reçu la même passe. Une dizaine de valeurs restées en dur, calées sur l'encre sombre, s'y effondraient.

La correction n'a pas consisté à retoucher ces valeurs une à une mais à appliquer la recommandation structurelle A : **un fichier de tokens unique**, `app/tokens.css`, importé par les deux layouts, où `.dark` n'est déclaré qu'une seule fois. Les tokens shadcn de `globals.css` y sont désormais mappés (`--background: var(--ink)`, `--foreground: var(--txt)`…) au lieu d'être redéfinis. La règle annoncée — *aucune couleur littérale hors du fichier de tokens et de `palette.ts`* — est tenue.

La **fracture entre les deux groupes de routes** est résorbée : les pages légales n'écrivent plus un seul `slate-*`, `gray-*` ou `blue-*`, et ne portent plus aucune classe `dark:` — elles consomment `text-foreground`, `text-muted-foreground`, `bg-background`, `text-link`. Le thème sombre y fonctionne par la couche de tokens, sans code dédié.

---

## 1. Tableau récapitulatif — état de traitement

### Critique

| Fichier | Problème d'origine | État |
|---|---|---|
| `HelpButton.tsx` | Fond du popover en dur `rgba(8,16,15,.95)` → **1,08:1** en clair, texte invisible | ✅ `background: var(--surface-solid)`. **Mesuré 18,69:1** en clair, 15,88:1 en sombre |
| `dashboard.css` — `.skeleton-bar` | `rgba(241,245,244,.12)` → **1,01:1**, squelettes invisibles en clair | ✅ Token `--skeleton` par thème. Voir *écart assumé n° 1* |
| `palette.ts` — `NO_DATA`, `ATMO_COLORS[0]`, `VIGILANCE_COLORS[0]` | `rgba(241,245,244,.18)` → **1,02:1**, commune sans mesure indiscernable | ✅ Token `--no-data` (`#778782` clair / `#8b9c97` sombre), **doublé d'un contour tireté** `.is-no-data` : l'absence de mesure ne repose plus sur la seule couleur — aucun aplat ne peut tenir 3:1 à la fois contre la scène et contre les remplissages ATMO voisins |
| `SidePanel.tsx` / `dashboard.css` | `aria-current` posé, `[aria-selected]` ciblé → règle jamais appliquée | ✅ Les deux alignés sur `aria-current='true'` |
| `palette.ts` — `waterColor(0)` | **Reclassé depuis « mineur »** — voir encadré ci-dessous | ✅ Tokens `--water-0/1/2` par thème |

> **Reclassement — la couche eau était un critique déguisé en mineur.**
> L'audit initial rangeait `waterColor(0)` parmi les points mineurs, en le décrivant comme un problème d'esthétique (« la couleur la plus sombre et la plus lourde »). C'était une erreur de classement : la conséquence n'était pas cosmétique mais **sémantique**. En thème clair, l'état « aucune coupure » était rendu par la teinte la plus grave de l'échelle, et les états dégradés par des pastels chauds — *la carte « tout va bien » se lisait comme la plus alarmante*. Pour un service dont l'objet est de signaler des coupures d'eau, une inversion de la saillance est un défaut d'information, au même rang que les trois autres critiques.
> **Corrigé** en inversant le poids par thème : `--water-0` passe de `#4b6660` (sombre, lourd) à `#a8c6b6` en clair — un vert-de-gris léger — tandis que `--water-1` et `--water-2` deviennent `#96650f` et `#6d2a0d`, saturés et sombres. La gravité est du côté des jours coupés dans les deux thèmes.

### Majeur

| Fichier | Problème d'origine | État |
|---|---|---|
| `CommuneDetail.tsx` — `.status-tag` | `#79bd8c` sur fond teinté → **2,00:1** ; `#e2c76a` → **1,56:1** en clair | ✅ Tokens `--ok-fg/--ok-bg`, `--warn-fg/--warn-bg`. **Mesuré 5,59 et 5,68:1** en clair |
| `dashboard.css` — `.bar-track` | `rgba(241,245,244,.08)` → **1,01:1** | ✅ Token `--track`. Voir *écart assumé n° 1* |
| `dashboard.css` — `.dashboard-footer` | `--mut2` 10 px sous le halo → **3,83:1** | ✅ Passé à `--mut`, **et** halo neutralisé en clair (`--stage-halo` à alpha 0) ; taille portée à 11,5 px |
| `SidePanel.tsx` | `role="list"` avec enfants `<button>`, 32 arrêts de tabulation | ✅ Descendu en gamme : `<ul>`/`<li>`/`<button aria-current>`, gestionnaire de flèches retiré |
| `SidePanel.tsx` | `role="tablist"` sans `tabpanel` ni `aria-controls` | ✅ Remplacé par `<div role="group" aria-label="Donnée affichée">` + `aria-pressed` — le motif « filtre », plus juste que « onglets » |
| `DashboardClient.tsx` / `SidePanel.tsx` | Commune sélectionnée + recherche → plus aucun `h1` | ✅ Le repli du `h1` dépend de la même expression `showDetail` |
| `(legal)/layout.tsx` + pages | Landmark `main` imbriqué | ✅ `<main>` des pages remplacé par `<div>` |
| `HelpButton.tsx` | Cible 20 × 20 px (WCAG 2.2 – 2.5.8) | ✅ `padding: 6` + `min-width/height: 28px` |
| `HelpButton.tsx` | `role="dialog"` sans focus ni `Échap` ; `Échap` désélectionnait la commune | ✅ `aria-expanded`/`aria-controls`, `Escape` traité localement avec `stopPropagation` |
| `DashboardClient.tsx` | `theme` au lieu de `resolvedTheme` → premier clic mort | ✅ `resolvedTheme` |
| `ThemeToggle.tsx` | Même bug + bouton de repli sans `type` ni `onClick` | ✅ `resolvedTheme`, `type="button"`, `disabled` sur le repli |
| `dashboard.css` — `.search input` | Bordure à **1,35:1** → échec 1.4.11 | ✅ Token `--control-line`. **Mesuré 4,13:1** en clair, 5,59:1 en sombre |
| `dashboard.css` — `.btn-ghost`, `.theme-toggle-dashboard` | Contour à `--line` (1,35:1) | ✅ Idem `--control-line` ; `--line` réservé aux séparateurs décoratifs |
| `dashboard.css` — `.commune-path:focus` | Focus (2 px) indiscernable de la sélection (1,8 px) | ✅ Focus différencié par un **trait tireté** (`stroke-dasharray: 4 2.5`) — une forme, pas une épaisseur |
| `(legal)/*/page.tsx` | `pt-24` hérité d'une navbar supprimée | ✅ `py-12` |
| `(legal)/*/page.tsx` | `prose prose-slate dark:prose-invert` — plugin non installé, classes inertes | ✅ Classes retirées, mise en forme explicite |
| `(legal)/*/page.tsx` | `bg-white dark:bg-gray-900` → deux noirs raccordés en sombre | ✅ Retiré, le body porte la couleur |
| `(legal)/layout.tsx` + pages | Header/footer `max-w-3xl`, contenu `max-w-4xl` — ~110 caractères par ligne | ✅ `max-w-xl` partout, mesuré à ~78 caractères |
| `(legal)/layout.tsx` | `#main-content` sans lien d'évitement | ✅ Lien d'évitement ajouté |
| `DashboardClient.tsx` | Bannières en absolu sur une `.shell` non positionnée ; tutoriel les recouvrant | ✅ `position: relative` sur `.shell` ; recouvrement traité — voir ci-dessous |

> **Complément à ce dernier point.** La correction d'origine ne décalait que `.banner-stack`. Une vérification à 320 px a montré que le bandeau du tutoriel **recouvrait aussi l'en-tête** (marque, heure) et le haut du panneau — mesuré : bandeau 0→131 px contre en-tête 18→67 px — et ce **à toutes les largeurs** testées (320, 375, 768, 1024, 1440), pas seulement en mobile. C'est désormais l'ossature entière qui se décale, via `padding-top: var(--onboarding-h)` sur `body.dashboard-body`.
> Deux pièges rencontrés au passage, tous deux mesurés :
> - le décalage tenté en `margin-top` sur `.shell` était **sans effet, jusqu'en `!important`** ; le padding du body, lui, fonctionne ;
> - animer une propriété dont la valeur vient d'une variable CSS la laissait **bloquée à sa valeur de départ**. Les transitions concernées (`padding-top` du body, `top` du lien d'évitement) ont été retirées : il n'y a rien à animer sur un décalage présent dès le premier rendu.
>
> Le lien d'évitement a révélé un défaut dérivé : sa position de repos `top: -48px` ne le sortait plus de l'écran une fois l'ossature descendue — il venait se poser sur le bandeau. Elle reprend maintenant la hauteur du bandeau. **Vérifié : hors écran au repos (`bottom` à −8 px), et à 143 px — sous le bandeau — au focus.**

### Mineur

| Fichier | Problème d'origine | État |
|---|---|---|
| `dashboard.css` | Corps de texte à 9,5 / 10 / 11 px | ✅ Plus aucune valeur sous 11 px ; 11 px réservé aux étiquettes `.mono` et aux titres de section, conformément à la recommandation |
| `dashboard.css` | Interlignage non déclaré (~1,2 par défaut) | ✅ `line-height: 1.5` sur le corps du dashboard, 1,6 sur celui des pages légales |
| `dashboard.css` — `.chip` | `rgba(255,255,255,.04)` sans effet en clair | ✅ Token `--chip-bg` |
| `dashboard.css` — `.search-icon` | Teinte sauge sombre en dur | ✅ Token `--tint-sage` |
| `dashboard.css` — `.map-loading-orb` | Dégradé calé sur fond sombre | ✅ Token `--orb-tint` |
| `dashboard.css` — `.stage::after` | Halo appliqué aussi en clair, faisant tomber le pied de page à 3,83:1 | ✅ `--stage-halo` à alpha 0 en clair |
| `palette.ts` — `waterColor(0)` | — | ⬆️ **Reclassé en critique**, voir plus haut |
| `CookieBanner.tsx` | Ombre `rgba(0,0,0,.5)` calibrée pour fond sombre | ✅ Token `--shadow-pop` par thème |
| `globals.css` | CSS mort + 3 composants orphelins de `components/ui/` | ✅ Supprimés — `globals.css` passe de 304 à 59 lignes |
| `next.config.ts` | `/meteo → /?vue=temperature`, paramètre inconnu de `LAYER_BY_PARAM` | ✅ `/meteo → /` |
| `DashboardClient.tsx` | Liens du pied de page en `<a href>` → rechargement complet | ✅ `next/link` |
| `layout.tsx` / `CookieBanner.tsx` | GA sur les pages légales seulement, bandeau de consentement sur le dashboard seulement, textes contradictoires | ✅ Tranché dans le sens du retrait : **plus aucune trace de Google Analytics**, texte du bandeau et mentions légales alignés sur ce que le site fait réellement |
| `OnboardingTour.tsx` | `role="status"` pour un overlay interactif ; pas d'`Échap` | ✅ `role="region"` + `Escape` en phase de capture |
| `dashboard.css` | `prefers-reduced-motion` ne couvrait pas `.bar-fill` ni `.skip-link` | ✅ Couvert. `.skip-link` n'a plus de transition du tout (voir encadré ci-dessus) |
| `dashboard.css` — `.vigilance-banner` | Flex sans `min-width: 0` ni `flex-wrap` à 320 px | ✅ `flex-wrap: wrap` + `min-width: 0` sur `.level` et `.scope` |
| `dashboard.css` — `.archipelago-rail` | `top: 168px`, constante calée à la main | ✅ Recommandation C appliquée : `.stage-overlay` est une grille (`grid-area`), plus de coordonnées verticales calculées |
| `(dashboard)/layout.tsx` | Pas de `themeColor` ; layout légal sans `viewport` | ✅ `themeColor` par `media` dans les deux layouts |
| `MapStage.tsx` | `role="tooltip"` sans `aria-describedby` | ✅ Retiré — l'infobulle est purement visuelle, le `<title>` du tracé porte l'information |

---

## 2. Ratios mesurés après correction

Valeurs relevées dans Chrome sur la page rendue, alpha composé sur le fond réel.

### Indice ATMO — le chiffre en 64 px

C'était le dernier échec de contraste réel : `.atmo-index` reprenait la couleur de l'aplat de la carte, et quatre indices sur six passaient sous le seuil de 3:1 des grands caractères en thème clair (2,22 / 1,89 / 1,67 / 2,36).

La correction sépare deux usages qui n'ont pas les mêmes contraintes : **l'aplat de la carte reste vif** — il se lit contre ses voisins, pas contre du blanc — tandis que le chiffre passe par des tokens `--atmo-fg-1..6` dédiés au texte.

| Indice | Clair | Sombre | Seuil |
|---|---:|---:|---:|
| 1 — Bon | 6,47 | 7,87 | 3 |
| 2 — Moyen | 5,64 | 9,25 | 3 |
| 3 — Dégradé | 6,57 | 10,48 | 3 |
| 4 — Mauvais | 6,84 | 7,40 | 3 |
| 5 — Très mauvais | 7,37 | 4,94 | 3 |
| 6 — Extrêmement mauvais | 8,73 | 3,58 | 3 |

### Paires auparavant en échec

| Paire | Clair | Sombre | Seuil | |
|---|---:|---:|---:|:--:|
| Bulle d'aide (`--txt` sur `--surface-solid`) | 18,69 | 15,88 | 4,5 | ✅ |
| `.status-tag` « Planning à jour » | 5,59 | 6,09 | 4,5 | ✅ |
| `.status-tag` « À vérifier » | 5,68 | 7,73 | 4,5 | ✅ |
| Contour de contrôle (`--control-line`) | 4,13 | 5,59 | 3 | ✅ |
| Corps des pages légales | 6,18 | 7,79 | 4,5 | ✅ |
| Liens des pages légales | 7,51 | 10,23 | 4,5 | ✅ |

### Largeur 320 px

Testée réellement, en chargeant les pages dans une iframe de 320 px de large — les media queries répondent à la largeur de l'iframe, ce n'est pas une extrapolation. Chrome refusant de réduire une fenêtre sous ~1200 px, c'est le seul protocole disponible ici.

| Page | `scrollWidth` / `clientWidth` | Débordement horizontal |
|---|---|---|
| `/` (tableau de bord) | 320 / 320 | Aucun — zéro élément dépassant |
| `/mentions-legales` | 320 / 320 | Aucun |
| `/credits` | 320 / 320 | Aucun |

---

## 3. Écarts assumés

Deux points de l'audit initial ne sont pas portés à 3:1, délibérément.

**1. Squelettes de chargement (`--skeleton`) et pistes de barres (`--track`).** Mesurés à 1,35 et 1,48:1 en clair (1,40 et 1,31 en sombre). Ils étaient à **1,01:1**, c'est-à-dire littéralement invisibles ; ils ne le sont plus, et la correction demandée par l'audit — la tokenisation par thème — est faite. Les monter à 3:1 les transformerait en aplats sombres : un squelette aussi contrasté qu'un contenu se lit comme du contenu, et une piste aussi contrastée que son remplissage rend la proportion moins lisible, pas plus. Ni l'un ni l'autre ne porte d'information seule — la valeur de chaque barre est écrite en toutes lettres à côté (`.bar-head .value`), et l'état de chargement est par ailleurs annoncé. Ce sont des aides visuelles transitoires, hors du périmètre de 1.4.11.

**2. Redimensionnement de fenêtre pendant le tutoriel.** La hauteur réservée au bandeau est publiée par un `ResizeObserver`, doublé depuis d'un écouteur `resize` : la hauteur publiée pilote le décalage du contenu, ce qui modifie la mise en page, ce qui peut faire apparaître une barre de défilement — donc changer la largeur, donc la hauteur du bandeau. Chrome coupe silencieusement un observateur pris dans une telle boucle. **Vérifié que la publication est correcte à chaque chargement** (320, 375, 768, 1024, 1440 px) et qu'un événement `resize` émis manuellement corrige bien la valeur. **Non vérifié :** le redimensionnement d'une vraie fenêtre pendant que le tutoriel est ouvert — Chrome refuse ici de descendre sous ~1200 px, et redimensionner une iframe ne déclenche pas `resize` à l'intérieur. Le cas est étroit (première visite, fenêtre redimensionnée à la main) et son effet est une bande vide en haut de page, jamais un recouvrement.

---

## 4. Recommandations structurelles — état

| | Recommandation | État |
|---|---|---|
| A | Un seul jeu de tokens, deux thèmes | ✅ `app/tokens.css`, importé par les deux layouts, `.dark` déclaré une fois ; tokens shadcn mappés dessus |
| B | Traiter le thème clair comme référence | ✅ Les valeurs de repli sont celles du thème clair ; `WeatherGlyph`, `CookieBanner` et `OnboardingTour` ne portent plus de fallback sombre |
| C | Réunir le layout du dashboard | ✅ `.stage-overlay` est une grille nommée ; les constantes verticales en dur ont disparu |
| D | Choisir un motif ARIA et l'appliquer entièrement | ✅ Descente en gamme sur les trois : `<ul>`/`<li>`/`aria-current`, `role="group"`/`aria-pressed`, `aria-expanded`/`aria-controls` |
| E | Décider de la mesure d'audience avant de la documenter | ✅ Google Analytics retiré ; bandeau et mentions légales alignés |

---

## Ce qui est bien fait

Inchangé depuis l'audit initial, et toujours vrai :

- **Le thème sombre passe intégralement**, avec de la marge sur toutes les paires de texte.
- **Deux niveaux d'atténuation seulement** (`--mut`, `--mut2`), tous deux au-dessus de 4,5:1 dans les deux thèmes.
- **Le lien d'évitement du dashboard** est correct : masqué, révélé au focus clavier, ciblant la recherche plutôt que le début de la carte.
- **Les cibles tactiles** sont à 44 px partout où le code les fixe — la bulle d'aide, seule exception, est passée à 28 px.
- **La couleur n'est jamais seule** : légende avec libellé, pastilles doublées d'un texte, indice ATMO accompagné de son intitulé, absence de mesure portée par un contour tireté.
- **`prefers-reduced-motion`** est respecté par le CSS et, plus rare, en JavaScript : `DashboardClient` interroge `matchMedia` avant un `scrollIntoView({ behavior: 'smooth' })`.
- **Les états vides, de chargement et d'erreur sont tous couverts** : squelettes, orbe de chargement, bannière d'erreur avec « Réessayer », bannière hors-ligne, recherche sans résultat, prévision indisponible, aucune coupure planifiée, valeur uniforme sur tout le territoire.
- **L'état vit dans l'URL** en français (`?commune=97118&vue=eau`), avec `replaceState` pour ne pas polluer l'historique, et repli sur la vue d'ensemble si le code de commune est invalide — ce repli est désormais **dérivé au rendu** plutôt que posé par un effet.
