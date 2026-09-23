import * as React from 'react';
import type { Decorator, Preview } from '@storybook/nextjs-vite';
import { ThemeProvider } from 'next-themes';

/*
 * Les deux feuilles du produit, dans l'ordre où les layouts les chargent :
 * `globals.css` tire Tailwind puis `tokens.css`, et `dashboard.css` pose la
 * scène. Sans elles, les stories rendraient sur des valeurs de repli et
 * l'audit de contraste ne mesurerait pas le produit.
 *
 * Les polices, elles, sont chargées par `preview-head.html`, qui explique
 * pourquoi `next/font/google` ne convient pas sous Storybook.
 */
import '../app/globals.css';
import '../app/(dashboard)/dashboard.css';

/**
 * Pose `dashboard-body` sur le vrai `<body>` du preview.
 *
 * `dashboard.css` cible `body.dashboard-body` : la classe portée par un `div`
 * enveloppant ne correspond à rien, et les stories rendaient en `system-ui` sur
 * fond blanc — donc avec d'autres métriques et d'autres contrastes que le
 * produit. Sur le `body`, ce sont exactement les règles de production qui
 * s'appliquent.
 *
 * Seule exception, `overflow: hidden` : c'est une contrainte de la coque de
 * l'application, pas une propriété du design system, et elle empêcherait de
 * faire défiler les pages de documentation.
 */
function DashboardBody({ children }: { children: React.ReactNode }) {
  React.useLayoutEffect(() => {
    const { body } = document;
    body.classList.add('dashboard-body');
    body.style.overflow = 'auto';
    return () => {
      body.classList.remove('dashboard-body');
      body.style.removeProperty('overflow');
    };
  }, []);

  return <>{children}</>;
}

/**
 * Applique le thème choisi dans la barre d'outils.
 *
 * `next-themes` pilote la classe `.dark` en production ; on le garde ici plutôt
 * que de poser la classe à la main, pour que les composants qui appellent
 * `useTheme()` (ThemeToggle) fonctionnent dans Storybook comme dans l'app.
 *
 * `forcedTheme` et non `defaultTheme` : la story doit rendre le thème demandé,
 * pas celui que le système de la machine de CI se trouve avoir.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme as 'light' | 'dark';

  return (
    <ThemeProvider attribute="class" forcedTheme={theme}>
      <DashboardBody>
        <div style={{ padding: '2rem' }}>
          <Story />
        </div>
      </DashboardBody>
    </ThemeProvider>
  );
};

const preview: Preview = {
  decorators: [withTheme],

  globalTypes: {
    theme: {
      description: 'Thème clair ou sombre',
      toolbar: {
        title: 'Thème',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Clair' },
          { value: 'dark', icon: 'moon', title: 'Sombre' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: { theme: 'light' },

  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },

    /*
     * `error` et non `todo` : une violation axe fait échouer le test, donc la
     * CI. C'est tout l'intérêt — un composant inaccessible ne doit pas pouvoir
     * être fusionné en silence.
     */
    a11y: { test: 'error' },

    // Le fond vient de `body.dashboard-body`, pas de l'addon.
    backgrounds: { disable: true },
  },
};

export default preview;
