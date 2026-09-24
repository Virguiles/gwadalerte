/**
 * Contraste WCAG 2.x — l'arithmétique seule.
 *
 * Aucune dépendance à Node : ce module sert aussi bien aux tests unitaires
 * qu'aux pages de fondations de Storybook, qui mesurent les couleurs telles
 * que le navigateur les calcule. La lecture de `tokens.css` sur le disque vit
 * à côté, dans `contrast.tokens.ts`.
 *
 * Il ne sert qu'aux tests et à la documentation : aucun composant ne
 * l'importe, il ne part donc pas dans le bundle de production.
 */

export type Theme = 'light' | 'dark';

/** Couleur RGB opaque, canaux 0-255. */
export type Rgb = { r: number; g: number; b: number };

/** Couleur pouvant être translucide — `a` vaut 1 quand elle est opaque. */
export type Rgba = Rgb & { a: number };

export function parseColor(value: string): Rgba {
  const css = value.trim();

  /*
   * #rgb, #rgba, #rrggbb et #rrggbbaa : Chrome sérialise désormais certaines
   * couleurs calculées sous cette dernière forme plutôt qu'en rgba(), y
   * compris pour des propriétés personnalisées lues via `getComputedStyle` —
   * `--mut` (rgba(11, 20, 19, 0.68), écrite ainsi dans tokens.css) revenait
   * en `#0b1413ad` dans Storybook publié, alors que Vitest + Playwright ne
   * l'a jamais reproduit. Les deux formats à 4 et 8 chiffres portent l'alpha
   * sur le dernier canal.
   */
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(css);
  if (hex) {
    const short = hex[1].length <= 4;
    const d = short
      ? hex[1]
          .split('')
          .map((c) => c + c)
          .join('')
      : hex[1];
    return {
      r: parseInt(d.slice(0, 2), 16),
      g: parseInt(d.slice(2, 4), 16),
      b: parseInt(d.slice(4, 6), 16),
      a: d.length === 8 ? parseInt(d.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i.exec(css);
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
      a: rgb[4] === undefined ? 1 : Number(rgb[4]),
    };
  }

  throw new Error(`Couleur non reconnue : « ${css} »`);
}

/**
 * Compose une couleur translucide sur son fond — « source-over ».
 *
 * L'audit insiste sur ce point : `--mut` est une encre à 68 %, et la juger sur
 * sa valeur nominale plutôt que sur le résultat composé donnait des ratios
 * faux — dans le sens rassurant.
 */
export function flatten(fg: Rgba, bg: Rgb): Rgb {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
  };
}

/** Luminance relative — WCAG 2.x, § relative luminance. */
export function luminance({ r, g, b }: Rgb): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Ratio de contraste entre deux couleurs opaques, de 1:1 à 21:1. */
export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Ratio entre deux couleurs CSS quelconques, la première posée sur la seconde,
 * la seconde posée sur `stage`.
 *
 * Les trois peuvent être translucides ; `stage` est la couleur la plus basse
 * de la pile — sur le produit, la scène `--ink`.
 */
export function ratioOf(foreground: string, background: string, stage: string): number {
  const flatStage = parseColor(stage);
  const flatBg = flatten(parseColor(background), flatStage);
  return contrast(flatten(parseColor(foreground), flatBg), flatBg);
}

/** Arrondi à deux décimales, comme les ratios notés dans `tokens.css`. */
export function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Le niveau WCAG 2.2 atteint par un ratio, pour un usage donné. */
export function grade(value: number, usage: 'text' | 'large' | 'nonText'): 'AAA' | 'AA' | 'échec' {
  if (usage === 'text') return value >= 7 ? 'AAA' : value >= 4.5 ? 'AA' : 'échec';
  if (usage === 'large') return value >= 4.5 ? 'AAA' : value >= 3 ? 'AA' : 'échec';
  // 1.4.11 ne connaît qu'un seuil : 3:1, sans niveau supérieur.
  return value >= 3 ? 'AA' : 'échec';
}
