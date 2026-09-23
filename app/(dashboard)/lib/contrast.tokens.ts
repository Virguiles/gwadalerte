/**
 * Lecture de `app/tokens.css` depuis le disque, pour les tests.
 *
 * Les ratios de l'audit sont écrits en commentaire à côté de chaque token
 * (« Mesuré sur `--ink2` clair : 6,46 / 5,64 … »). Un commentaire ne se
 * vérifie pas : ce module lit la feuille, résout les `var()` et rend les
 * couleurs littérales, pour que `contrast.test.ts` puisse tenir ces nombres
 * pour vrais — ou faire échouer la construction.
 *
 * Node uniquement. L'arithmétique, elle, vit dans `contrast.ts`.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ratioOf, type Theme } from './contrast';

const TOKENS_PATH = fileURLToPath(new URL('../../tokens.css', import.meta.url));

/*
 * Un token par ligne `--nom: valeur;`. La feuille est écrite à la main et s'en
 * tient à cette forme : pas besoin d'un analyseur CSS complet, qui masquerait
 * en plus le jour où elle cesserait d'être aussi simple.
 */
const DECLARATION = /^\s*(--[\w-]+)\s*:\s*([^;]+);/gm;

/*
 * Le sélecteur est cherché en début de ligne, et non n'importe où : le
 * commentaire d'en-tête de `tokens.css` mentionne « `.dark` restaure le thème
 * sombre », et un `indexOf` brut tombait sur cette phrase puis extrayait le
 * bloc `:root` qui suit — le thème sombre était alors mesuré avec les couleurs
 * du thème clair, sans que rien ne le signale.
 */
function extractBlock(css: string, selector: string): string {
  const anchor = new RegExp(`^${selector.replace('.', '\\.')}\\s*\\{`, 'm');
  const found = anchor.exec(css);
  if (!found) throw new Error(`Bloc « ${selector} » introuvable dans tokens.css`);

  const open = css.indexOf('{', found.index);
  let depth = 0;

  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }

  throw new Error(`Bloc « ${selector} » non refermé dans tokens.css`);
}

/**
 * Les tokens d'un thème, `var()` non résolues.
 *
 * `.dark` ne redéclare que ce qui change : il est donc fusionné par-dessus
 * `:root`, exactement comme la cascade le fait dans le navigateur.
 */
export function readTokens(theme: Theme): Map<string, string> {
  const css = readFileSync(TOKENS_PATH, 'utf8');
  const blocks = theme === 'dark' ? [':root', '.dark'] : [':root'];
  const tokens = new Map<string, string>();

  for (const selector of blocks) {
    for (const [, name, value] of extractBlock(css, selector).matchAll(DECLARATION)) {
      tokens.set(name, value.trim());
    }
  }

  return tokens;
}

/** Résout les `var(--x, repli)` jusqu'à obtenir une couleur littérale. */
export function resolve(
  value: string,
  tokens: Map<string, string>,
  seen = new Set<string>(),
): string {
  const match = /^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/.exec(value.trim());
  if (!match) return value.trim();

  const [, name, fallback] = match;
  if (seen.has(name)) throw new Error(`Cycle de var() sur ${name}`);
  seen.add(name);

  const next = tokens.get(name) ?? fallback;
  if (next === undefined) throw new Error(`Token ${name} introuvable et sans repli`);

  return resolve(next, tokens, seen);
}

/** Le ratio d'un token de premier plan sur un token de fond, dans un thème. */
export function ratio(foreground: string, background: string, theme: Theme): number {
  const tokens = readTokens(theme);
  return ratioOf(
    resolve(foreground, tokens),
    resolve(background, tokens),
    resolve('var(--ink)', tokens),
  );
}
