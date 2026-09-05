'use client';

import { useSyncExternalStore } from 'react';

/**
 * Deux lectures qui n'existent qu'après hydratation — le montage lui-même, et
 * un drapeau posé dans `localStorage` — sans passer par un effet.
 *
 * `useEffect` + `setState` était le motif habituel (celui de next-themes), mais
 * React le décourage désormais : il force un second rendu à chaque montage, et
 * `react-hooks/set-state-in-effect` le signale. `useSyncExternalStore` dit la
 * même chose en une fois, avec un instantané serveur explicite.
 */

/** Aucun de ces instantanés ne bouge tout seul : il n'y a rien à écouter. */
const noSubscribe = () => () => {};

const alwaysTrue = () => true;
const alwaysFalse = () => false;

/** `false` pendant le prérendu, `true` une fois hydraté. */
export function useMounted(): boolean {
  return useSyncExternalStore(noSubscribe, alwaysTrue, alwaysFalse);
}

/**
 * Le drapeau `key` est-il déjà posé ? Vrai pendant le prérendu et si
 * `localStorage` est inaccessible (navigation privée, stockage bloqué) : dans
 * le doute on considère la chose déjà vue, plutôt que de rouvrir un bandeau à
 * chaque visite chez quelqu'un qui ne peut pas le faire taire.
 *
 * L'instantané est un booléen, donc comparé par valeur : le relire à chaque
 * rendu ne déclenche aucune boucle. Il ne change qu'après une écriture, que le
 * composant appelant accompagne déjà de son propre changement d'état.
 */
export function useStoredFlag(key: string): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      try {
        return localStorage.getItem(key) !== null;
      } catch {
        return true;
      }
    },
    alwaysTrue,
  );
}
