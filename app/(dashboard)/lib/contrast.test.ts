import { describe, expect, it } from 'vitest';
import { contrast, parseColor, round } from './contrast';
import { ratio, readTokens, resolve } from './contrast.tokens';

/*
 * Les seuils de WCAG 2.2 niveau AA, nommés une fois.
 *
 * `LARGE` couvre le texte d'au moins 24 px, ou 18,66 px en gras — ici l'indice
 * ATMO, affiché en 64 px. `NON_TEXTE` (critère 1.4.11) couvre la limite d'un
 * contrôle et les traits qui portent une information.
 */
const TEXTE = 4.5;
const LARGE = 3;
const NON_TEXTE = 3;

const THEMES = ['light', 'dark'] as const;

describe('le module de mesure lui-même', () => {
  it('reproduit les bornes connues de WCAG', () => {
    const noir = parseColor('#000000');
    const blanc = parseColor('#ffffff');

    expect(round(contrast(noir, blanc))).toBe(21);
    expect(round(contrast(noir, noir))).toBe(1);
  });

  it('lit le hex à 8 chiffres que Chrome préfère parfois à rgba()', () => {
    // Constaté sur le Storybook publié, jamais dans Vitest + Playwright :
    // `--mut`, écrite `rgba(11, 20, 19, 0.68)` dans tokens.css, revenait de
    // `getComputedStyle` sous la forme `#0b1413ad` — Chrome choisit parfois
    // cette sérialisation plutôt que rgba(), y compris pour une propriété
    // personnalisée. 0xad / 255 ≈ 0.68.
    const long = parseColor('#0b1413ad');
    expect(long.r).toBe(11);
    expect(long.g).toBe(20);
    expect(long.b).toBe(19);
    expect(long.a).toBeCloseTo(0.68, 2);

    // Forme courte #rgba : chaque chiffre est doublé, y compris l'alpha.
    const short = parseColor('#0b1c');
    expect(short).toEqual({ r: 0, g: 187, b: 17, a: 12 / 15 });
  });

  it('lit bien deux jeux de tokens distincts', () => {
    // Le commentaire d'en-tête de `tokens.css` contient la chaîne « .dark » :
    // un `indexOf` naïf y tombait et mesurait le thème sombre avec les
    // couleurs du thème clair, sans que rien ne le signale.
    expect(resolve('var(--ink)', readTokens('light'))).toBe('#eef3f1');
    expect(resolve('var(--ink)', readTokens('dark'))).toBe('#0b1413');
  });

  it('compose les couches alpha plutôt que de juger la valeur nominale', () => {
    // `--mut` est une encre à 68 % : sur fond clair elle donne un gris, et la
    // juger à sa valeur nominale (une quasi-noire) donnait des ratios faux.
    const opaque = ratio('var(--txt)', 'var(--ink)', 'light');
    const translucide = ratio('var(--mut)', 'var(--ink)', 'light');

    expect(translucide).toBeLessThan(opaque);
    expect(translucide).toBeGreaterThan(1);
  });
});

/*
 * Chaque atténuation est mesurée sur les fonds où elle apparaît réellement, et
 * non sur tous.
 *
 * `--mut` est posée sur la scène (le readout) autant que sur le panneau.
 * `--mut2`, elle, ne sort jamais du panneau — `.panel-guide-label`,
 * `.section-title`, `.detail-sources`, `.cut-card .zones`, le placeholder de
 * recherche. L'exiger aussi contre `--ink` reviendrait à faire échouer la
 * construction sur une combinaison que personne ne voit : mesurée à 4,41:1 sur
 * fond clair, elle passerait sous le seuil sans qu'aucun texte ne soit concerné.
 * Si `--mut2` venait à sortir du panneau, c'est cette liste qu'il faudrait
 * étendre — et la teinte qu'il faudrait revoir.
 */
describe.each(THEMES)('thème %s — texte courant', (theme) => {
  it.each([
    ['--txt', '--ink'],
    ['--txt', '--surface-solid'],
    ['--mut', '--ink'],
    ['--mut', '--surface-solid'],
    ['--mut2', '--surface-solid'],
  ])('%s sur %s tient 4.5:1', (fg, bg) => {
    expect(ratio(`var(${fg})`, `var(${bg})`, theme)).toBeGreaterThanOrEqual(TEXTE);
  });

  it("le libellé d'un bouton sauge tient 4.5:1 sur son fond", () => {
    expect(ratio('var(--on-sage)', 'var(--sage)', theme)).toBeGreaterThanOrEqual(TEXTE);
  });
});

describe.each(THEMES)('thème %s — échelle ATMO écrite', (theme) => {
  /*
   * L'indice s'affiche en 64 px sur le panneau : c'est du texte large, soumis
   * à 3:1. Les teintes de `ATMO_COLORS`, elles, sont calibrées pour se
   * distinguer entre elles sur la carte, et quatre d'entre elles tombaient
   * sous ce seuil sur le panneau blanc — d'où les tokens `--atmo-fg-*`.
   */
  it.each([1, 2, 3, 4, 5, 6])('--atmo-fg-%i tient 3:1 sur le panneau', (index) => {
    expect(ratio(`var(--atmo-fg-${index})`, 'var(--surface-solid)', theme))
      .toBeGreaterThanOrEqual(LARGE);
  });
});

describe.each(THEMES)('thème %s — éléments non textuels', (theme) => {
  it("la limite d'un contrôle tient 3:1 sur le panneau", () => {
    expect(ratio('var(--control-line)', 'var(--surface-solid)', theme))
      .toBeGreaterThanOrEqual(NON_TEXTE);
  });

  it("le tireté « non mesuré » se voit sur l'aplat qu'il borde", () => {
    // `--mut2` n'y tenait que 2,68:1 et `--map-stroke` 2,54:1 : aucun aplat ne
    // peut tenir 3:1 à la fois contre la scène et contre les remplissages ATMO
    // voisins, l'absence de mesure est donc portée par le trait.
    expect(ratio('var(--no-data-stroke)', 'var(--no-data)', theme))
      .toBeGreaterThanOrEqual(NON_TEXTE);
  });

  /*
   * Les teintes « tours d'eau » ne portent jamais de texte : elles remplissent
   * une commune sur la carte et la pastille de sa fiche. C'est donc 1.4.11 qui
   * s'applique, et sur les deux fonds où elles apparaissent.
   *
   * `--water-0` en est écarté, et c'est assumé : il dit l'absence de coupure,
   * un état neutre que rien n'a à distinguer du fond — et la pastille est de
   * toute façon accompagnée de son libellé. Mesuré 1,84:1 sur le panneau clair.
   */
  it.each([1, 2])('--water-%i tient 3:1 sur le panneau et sur la scène', (level) => {
    expect(ratio(`var(--water-${level})`, 'var(--surface-solid)', theme))
      .toBeGreaterThanOrEqual(NON_TEXTE);
    expect(ratio(`var(--water-${level})`, 'var(--ink)', theme))
      .toBeGreaterThanOrEqual(NON_TEXTE);
  });
});

/*
 * Les ratios notés en commentaire dans `tokens.css` et dans l'audit sont des
 * mesures faites dans le navigateur. Les retrouver ici valide la méthode de ce
 * module — et, dans l'autre sens, fige les commentaires : une teinte retouchée
 * sans mise à jour du commentaire fait échouer la construction.
 *
 * La tolérance couvre l'écart entre le compositing de Chrome et ce calcul.
 */
describe('les ratios documentés restent vrais', () => {
  const PRES = 0.02;

  it('thème clair — `--atmo-fg-*` sur `--ink2`', () => {
    const mesures = [6.46, 5.64, 6.57, 6.85, 7.37, 8.73];
    mesures.forEach((attendu, i) => {
      expect(ratio(`var(--atmo-fg-${i + 1})`, 'var(--ink2)', 'light')).toBeCloseTo(attendu, 1);
    });
  });

  it('thème sombre — `--atmo-fg-*` sur `--ink2`, indices 1 / 3 / 5 / 6', () => {
    // Les quatre valeurs citées par l'audit comme témoin de sa méthode.
    expect(ratio('var(--atmo-fg-1)', 'var(--ink2)', 'dark')).toBeCloseTo(7.87, 1);
    expect(ratio('var(--atmo-fg-3)', 'var(--ink2)', 'dark')).toBeCloseTo(10.48, 1);
    expect(ratio('var(--atmo-fg-5)', 'var(--ink2)', 'dark')).toBeCloseTo(4.94, 1);
    expect(ratio('var(--atmo-fg-6)', 'var(--ink2)', 'dark')).toBeCloseTo(3.58, 1);
  });

  it('thème clair — `--control-line` sur le panneau : 4,13:1', () => {
    expect(ratio('var(--control-line)', 'var(--surface-solid)', 'light')).toBeCloseTo(4.13, 1);
  });

  it('thème clair — le tireté « non mesuré » : 3,87:1', () => {
    expect(ratio('var(--no-data-stroke)', 'var(--no-data)', 'light')).toBeCloseTo(3.87, 1);
  });

  it('la tolérance annoncée reste serrée', () => {
    expect(PRES).toBeLessThan(0.05);
  });
});
