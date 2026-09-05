'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Bulle d'aide contextuelle.
 *
 * Ce n'est pas une boîte de dialogue : c'est un dépliant. `role="dialog"`
 * promettait une gestion du focus et une fermeture par Échap que le composant
 * ne fournissait pas — `aria-expanded` / `aria-controls` décrit exactement ce
 * qui se passe, sans rien promettre de plus.
 *
 * Échap est écouté en phase de *capture* sur le document, et la propagation y
 * est stoppée : sans ça, le raccourci global du tableau de bord (voir
 * DashboardClient) recevait la touche en premier et désélectionnait la commune
 * au lieu de fermer l'aide.
 */
export function HelpButton({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLSpanElement | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const panelId = React.useId();

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setOpen(false);
      // Le focus revient à la commande qui a ouvert le dépliant, sans quoi il
      // repartirait au début du document.
      buttonRef.current?.focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Aide : ${title}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        style={{
          display: 'grid',
          placeItems: 'center',
          /* WCAG 2.2 — 2.5.8 : 24 px minimum. L'icône seule en faisait 20. */
          minWidth: 28,
          minHeight: 28,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: open ? 'var(--sage)' : 'var(--mut2)',
          padding: 6,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--sage)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = open ? 'var(--sage)' : 'var(--mut2)')}
      >
        <HelpCircle size={16} aria-hidden="true" />
      </button>
      {open && (
        <div
          id={panelId}
          style={{
            position: 'absolute',
            top: 30,
            left: 0,
            zIndex: 10,
            /* Le fond était `rgba(8, 16, 15, 0.95)` en dur — de l'encre sombre
               sous du texte sombre en thème clair, soit 1,08:1. */
            background: 'var(--surface-solid)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-pop)',
            borderRadius: 8,
            padding: 10,
            width: 220,
            fontSize: 12,
            color: 'var(--txt)',
            lineHeight: 1.5,
          }}
          role="group"
          aria-label={title}
        >
          <strong style={{ display: 'block', marginBottom: 6, fontSize: 12.5 }}>{title}</strong>
          <div>{children}</div>
        </div>
      )}
    </span>
  );
}
