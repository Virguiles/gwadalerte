'use client';

import React from 'react';
import { useStoredFlag } from '@/app/hooks/useClientFlag';

const ACCEPTED_KEY = 'gwada_cookie_accepted';

export function CookieBanner() {
  // Déjà accepté lors d'une visite précédente ? La réponse vient du stockage,
  // pas d'un effet : le bandeau ne clignote plus au montage.
  const accepted = useStoredFlag(ACCEPTED_KEY);
  // Accepté à l'instant, dans cette page : l'écriture ci-dessous ne prévient
  // personne, c'est donc cet état qui referme le bandeau.
  const [dismissed, setDismissed] = React.useState(false);

  if (accepted || dismissed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        right: 16,
        left: 16,
        marginLeft: 'auto',
        zIndex: 60,
        background: 'var(--surface-solid, #ffffff)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: 12,
        maxWidth: 320,
        width: 'auto',
        fontSize: 11,
        color: 'var(--txt)',
        lineHeight: 1.4,
        boxShadow: 'var(--shadow-pop)',
      }}
      role="status"
      aria-label="Information sur le stockage local"
    >
      {/*
        Le texte disait « un stockage local uniquement pour votre préférence
        d'affichage ». Le code en écrit davantage — thème, progression dans
        l'aide, et un cache des dernières données pour l'affichage hors ligne
        (voir useCachedResource et useMeteoData). Et il ne dépose aucun cookie.
      */}
      <p style={{ margin: 0, marginBottom: 8 }}>
        Ce site ne dépose aucun cookie et n&apos;utilise aucun outil de mesure d&apos;audience.
        Votre navigateur garde seulement votre thème, votre progression dans l&apos;aide et les
        dernières données reçues, pour rester consultable hors ligne. Rien n&apos;en sort.
      </p>
      <button
        onClick={() => {
          try { localStorage.setItem(ACCEPTED_KEY, '1'); } catch {}
          setDismissed(true);
        }}
        style={{
          padding: '10px 18px',
          minHeight: 44,
          borderRadius: 999,
          border: '1px solid transparent',
          background: 'var(--sage)',
          color: 'var(--on-sage, #ffffff)',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        J&apos;ai compris
      </button>
    </div>
  );
}
