'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/app/hooks/useClientFlag';

const BUTTON_CLASS =
  'p-2 rounded-md text-foreground hover:bg-muted focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-ring transition-colors';

export function ThemeToggle() {
  /*
   * `resolvedTheme` et non `theme` : avec `defaultTheme="system"`, `theme` vaut
   * « system » et jamais « dark ». Le bouton annonçait donc « passer en thème
   * sombre » sur un système déjà sombre, et le premier clic ne changeait rien.
   */
  const { resolvedTheme, setTheme } = useTheme();

  /*
   * Le montage passait par `useEffect` + `setState` enveloppé dans
   * `startTransition` — un contournement de `react-hooks/set-state-in-effect`,
   * pas une correction. `useMounted` dit la même chose sans second rendu, et
   * c'est le même mécanisme que les trois autres gardes de montage du dépôt.
   */
  const mounted = useMounted();

  // Avant montage le thème résolu est inconnu : le bouton est rendu inerte
  // plutôt que d'agir au hasard — il n'avait ni `type` ni `onClick`, et
  // proposait donc une commande qui ne faisait rien.
  if (!mounted) {
    return (
      <button type="button" className={BUTTON_CLASS} aria-label="Changer de thème" disabled>
        <Sun className="h-5 w-5" aria-hidden="true" />
      </button>
    );
  }

  const dark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className={BUTTON_CLASS}
      aria-label={dark ? 'Passer en thème clair' : 'Passer en thème sombre'}
    >
      {dark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
