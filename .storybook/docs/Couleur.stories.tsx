import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { grade, ratioOf, round } from '../../app/(dashboard)/lib/contrast';

/**
 * Les couleurs du produit, mesurées dans le navigateur.
 *
 * Cette page ne recopie aucune valeur : elle lit les tokens tels que le
 * navigateur les calcule (`getComputedStyle`) et recalcule chaque ratio à
 * l'affichage. Une teinte retouchée dans `app/tokens.css` se voit ici à la
 * seconde suivante — une documentation de palette ne peut donc pas diverger de
 * la palette qu'elle documente.
 *
 * Les mêmes ratios sont assertés hors navigateur dans
 * `app/(dashboard)/lib/contrast.test.ts` : la CI échoue si l'un d'eux passe
 * sous son seuil.
 */
const meta = {
  title: 'Fondations/Couleur',
  parameters: {
    layout: 'fullscreen',
    // La page est une grille de démonstration, pas un composant : ses
    // échantillons ne sont pas du texte et n'ont pas à tenir 4.5:1 eux-mêmes.
    a11y: { test: 'todo' },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Lit un token sur `:root` tel que le navigateur le calcule. */
function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Renvoie un compteur qui change chaque fois que `<html>` change de classe.
 *
 * Sans lui, la page mesurait le thème clair même en story sombre : les effets
 * remontent des enfants vers les parents, et ceux de cette page tournent donc
 * *avant* que `next-themes` — son parent — n'ait posé `.dark`. Un
 * `MutationObserver` ne dépend d'aucun ordre, et fait en prime que la page se
 * remesure quand on bascule le thème depuis la barre d'outils.
 */
function useThemeRevision(): number {
  const [revision, setRevision] = React.useState(0);

  React.useEffect(() => {
    const observer = new MutationObserver(() => setRevision((n) => n + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    return () => observer.disconnect();
  }, []);

  return revision;
}

type Usage = 'text' | 'large' | 'nonText';

const SEUIL: Record<Usage, string> = { text: '4.5:1', large: '3:1', nonText: '3:1' };

type Entree = {
  token: string;
  libelle: string;
  /**
   * Écart assumé. Le seuil ne s'applique pas à cette entrée, et la raison est
   * affichée à côté — un écart tu est un écart oublié.
   */
  exception?: string;
};

function Ratio({ fg, bg, usage }: { fg: string; bg: string; usage: Usage }) {
  const value = round(ratioOf(token(fg), token(bg), token('--ink')));
  const niveau = grade(value, usage);
  const echec = niveau === 'échec';

  return (
    <span
      data-verdict={echec ? 'échec' : 'ok'}
      title={`${fg} sur ${bg} — seuil ${SEUIL[usage]}`}
      style={{
        fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
        fontSize: 11,
        letterSpacing: '0.04em',
        color: echec ? 'var(--atmo-fg-5)' : 'var(--mut)',
        fontWeight: echec ? 700 : 400,
        whiteSpace: 'nowrap',
      }}
    >
      {value.toFixed(2)}:1 · {niveau}
    </span>
  );
}

function Echelle({
  titre,
  note,
  entrees,
  usage,
  fond = '--surface-solid',
}: {
  titre: string;
  note: string;
  entrees: Entree[];
  usage: Usage;
  fond?: string;
}) {
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>{titre}</h2>
      <p
        style={{
          fontSize: 12.5,
          lineHeight: 1.6,
          color: 'var(--mut)',
          margin: '0 0 6px',
          maxWidth: '62ch',
        }}
      >
        {note}
      </p>
      <p style={{ fontSize: 11, color: 'var(--mut2)', margin: '0 0 14px' }}>
        Seuil appliqué : {SEUIL[usage]}
      </p>

      <div style={{ display: 'grid', gap: 8 }}>
        {entrees.map((entree) => (
          <div
            key={entree.token}
            data-exception={entree.exception ? '' : undefined}
            style={{
              display: 'grid',
              gridTemplateColumns: '44px 1fr auto auto',
              alignItems: 'center',
              gap: 14,
              padding: '8px 12px',
              background: `var(${fond})`,
              border: '1px solid var(--line)',
              borderRadius: 8,
            }}
          >
            <span
              aria-hidden
              style={{
                height: 28,
                borderRadius: 6,
                background: `var(${entree.token})`,
                border: '1px solid var(--line)',
              }}
            />
            <span>
              <span style={{ fontSize: 13, color: `var(${entree.token})`, fontWeight: 600 }}>
                {entree.libelle}
              </span>
              {entree.exception && (
                <em
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontStyle: 'normal',
                    color: 'var(--mut)',
                    marginTop: 2,
                    maxWidth: '48ch',
                  }}
                >
                  Écart assumé — {entree.exception}
                </em>
              )}
            </span>
            <code style={{ fontSize: 11, color: 'var(--mut2)' }}>{entree.token}</code>
            <Ratio fg={entree.token} bg={fond} usage={usage} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Page() {
  // Le compteur n'est pas lu : il suffit qu'il change pour que toute la page,
  // et donc chaque mesure, soit recalculée.
  useThemeRevision();

  return (
    <div style={{ padding: '2rem', maxWidth: 880 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>Couleur</h1>
      <p
        style={{
          fontSize: 13,
          lineHeight: 1.65,
          color: 'var(--mut)',
          maxWidth: '62ch',
          margin: '0 0 2.5rem',
        }}
      >
        Toute la couleur du produit vit dans <code>app/tokens.css</code> et{' '}
        <code>app/(dashboard)/lib/palette.ts</code>. Aucun composant n&apos;écrit de valeur
        littérale. Les ratios ci-dessous sont recalculés à l&apos;affichage, sur les couleurs que
        le navigateur applique — basculez le thème dans la barre d&apos;outils pour les voir
        changer.
      </p>

      <Echelle
        titre="Texte"
        note="Trois niveaux d'atténuation, pas quatre : au-delà, aucune teinte ne tenait 4.5:1 sur les deux thèmes à la fois."
        usage="text"
        entrees={[
          { token: '--txt', libelle: 'Texte courant' },
          { token: '--mut', libelle: 'Métadonnée' },
          { token: '--mut2', libelle: 'Mention discrète — panneau uniquement' },
        ]}
      />

      <Echelle
        titre="Indice ATMO — écrit"
        note="L'indice s'affiche en 64 px : c'est du texte large, soumis à 3:1. Les teintes de la carte, elles, sont calibrées pour se distinguer entre elles sur la scène — quatre d'entre elles tombaient sous le seuil une fois posées sur le panneau blanc, d'où cette seconde échelle."
        usage="large"
        entrees={[1, 2, 3, 4, 5, 6].map((i) => ({
          token: `--atmo-fg-${i}`,
          libelle: ['Bon', 'Moyen', 'Dégradé', 'Mauvais', 'Très mauvais', 'Extrêmement mauvais'][
            i - 1
          ],
        }))}
      />

      <Echelle
        titre="Tours d'eau"
        note="Ces trois teintes ne portent jamais de texte : elles remplissent une commune sur la carte et la pastille de sa fiche. Le seuil applicable est donc celui des éléments non textuels. La gravité doit monter avec le nombre de coupures, et une échelle unique n'y parvient pas sur les deux thèmes — le sombre monte vers le jaune, le clair vers le brun."
        usage="nonText"
        entrees={[
          {
            token: '--water-0',
            libelle: 'Aucune coupure',
            exception:
              "état neutre, et non une information à distinguer : c'est l'absence de marqueur qui se lit. La pastille est en outre toujours accompagnée de son libellé.",
          },
          { token: '--water-1', libelle: '1 coupure' },
          { token: '--water-2', libelle: '2 coupures ou plus' },
        ]}
      />

      <Echelle
        titre="Éléments non textuels"
        note="WCAG 1.4.11 : la limite d'un contrôle et les traits porteurs d'information tiennent 3:1. --line reste réservée aux séparateurs décoratifs, que le critère dispense."
        usage="nonText"
        entrees={[
          { token: '--control-line', libelle: "Contour d'un contrôle" },
          { token: '--sage', libelle: 'Action principale' },
        ]}
      />
    </div>
  );
}

export const Palette: Story = {
  globals: { theme: 'light' },
  render: () => <Page />,
};

export const PaletteSombre: Story = {
  name: 'Palette — thème sombre',
  globals: { theme: 'dark' },
  render: () => <Page />,
};

/**
 * La page est aussi un test : si une échelle tombe en « échec » ailleurs que
 * sur un écart assumé, c'est que la palette a dérivé, et la CI s'arrête.
 *
 * Le thème est fixé explicitement — les `globals` persistent d'une story à
 * l'autre dans une même iframe, et la vérification porterait sinon sur le
 * thème que la story précédente se trouve avoir laissé.
 */
export const AucunEchec: Story = {
  name: 'Aucune échelle en échec',
  globals: { theme: 'light' },
  render: () => <Page />,
  play: async ({ canvasElement }) => {
    const echecs = Array.from(canvasElement.querySelectorAll('[data-verdict="échec"]'))
      .filter((el) => !el.closest('[data-exception]'))
      .map((el) => `${el.getAttribute('title')} → ${el.textContent}`);

    await expect(echecs).toEqual([]);
  },
};
