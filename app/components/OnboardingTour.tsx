'use client';

import React from 'react';
import { useStoredFlag } from '@/app/hooks/useClientFlag';

const DONE_KEY = 'gwada_onboarding_done';

export function OnboardingTour() {
  const [step, setStep] = React.useState(0);
  const barRef = React.useRef<HTMLDivElement | null>(null);
  // Tutoriel déjà vu lors d'une visite précédente ? Lu au stockage, pas posé
  // par un effet : plus de premier rendu vide suivi d'un rendu avec le bandeau.
  const done = useStoredFlag(DONE_KEY);
  // Fermé à l'instant : l'écriture dans `localStorage` ne prévient personne,
  // c'est donc cet état qui retire le bandeau.
  const [dismissed, setDismissed] = React.useState(false);
  const visible = !done && !dismissed;

  /*
   * Le bandeau est `fixed` en haut de la fenêtre : il recouvrait les bannières
   * d'erreur et hors-ligne, au premier chargement — précisément le moment où
   * une erreur de chargement est la plus probable. Sa hauteur réelle est donc
   * publiée, et `.banner-stack` descend d'autant (voir dashboard.css). Mesurée
   * plutôt que devinée : le texte passe sur deux ou trois lignes en mobile.
   */
  React.useEffect(() => {
    const node = visible ? barRef.current : null;
    if (!node) {
      document.documentElement.style.removeProperty('--onboarding-h');
      return;
    }
    const publish = () =>
      document.documentElement.style.setProperty('--onboarding-h', `${node.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(node);
    /*
     * `resize` en plus de l'observateur, et non à sa place : la hauteur publiée
     * pilote le décalage du contenu, ce qui modifie la mise en page, ce qui
     * peut faire apparaître ou disparaître une barre de défilement — donc
     * changer la largeur, donc la hauteur du bandeau. Chrome coupe
     * silencieusement un observateur pris dans une telle boucle, et la valeur
     * restait alors figée à la hauteur du premier calcul (mesuré : 131 px
     * conservés en s'élargissant, alors que le bandeau était retombé à 73 px,
     * laissant une bande vide en haut de page).
     */
    window.addEventListener('resize', publish);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', publish);
      document.documentElement.style.removeProperty('--onboarding-h');
    };
  }, [visible, step]);

  const finish = React.useCallback(() => {
    try {
      localStorage.setItem(DONE_KEY, '1');
    } catch {}
    setDismissed(true);
  }, []);

  /*
   * Échap referme le tutoriel. En phase de *capture*, propagation stoppée :
   * le raccourci global du tableau de bord aurait sinon reçu la touche en
   * premier et désélectionné la commune sans rien fermer.
   */
  React.useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      finish();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [visible, finish]);

  if (!visible) return null;

  const steps = [
    { title: 'Bienvenue', text: 'Gwad\'Alerte est un tableau de bord citoyen pour la Guadeloupe.' },
    { title: 'Explorer', text: 'Cliquez une commune sur la carte ou cherchez son nom avec la touche /' },
    { title: 'Changer de vue', text: 'Utilisez les onglets Air / Eau pour changer la donnée affichée.' },
    { title: 'Suivre', text: 'Le bandeau vigilance indique le niveau d\'alerte météo officiel.' },
  ];

  const current = steps[step];

  /*
   * `role="status"` annonçait une région live, alors que c'est une bande
   * interactive à quatre étapes que l'on parcourt soi-même. `region` la rend
   * atteignable comme un point de repère, sans promettre d'annonce automatique.
   */
  return (
    <div
      ref={barRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--surface-solid, #ffffff)',
        borderBottom: '1px solid var(--line)',
        padding: 'calc(12px + env(safe-area-inset-top, 0px)) 16px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
      role="region"
      aria-label={`Tutoriel d'accueil — étape ${step + 1} sur ${steps.length}`}
    >
      <div>
        <strong style={{ fontSize: 12, color: 'var(--sage)', letterSpacing: '0.08em' }}>
          {current.title} — {step + 1}/4
        </strong>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--txt)' }}>{current.text}</p>
      </div>
      <div style={{ display: 'flex', gap: 8, flex: 'none' }}>
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            style={{
              padding: '10px 18px',
              minHeight: 44,
              borderRadius: 999,
              border: '1px solid var(--line)',
              background: 'transparent',
              color: 'var(--txt)',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Suivant
          </button>
        ) : (
          <button
            onClick={finish}
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
            C&apos;est parti
          </button>
        )}
        <button
          onClick={finish}
          style={{
            padding: '10px 14px',
            minHeight: 44,
            borderRadius: 999,
            border: '1px solid var(--line)',
            background: 'transparent',
            color: 'var(--mut)',
            cursor: 'pointer',
            fontSize: 11,
          }}
        >
          Passer
        </button>
      </div>
    </div>
  );
}
