'use client';

import React from 'react';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/app/hooks/useClientFlag';
import { OnboardingTour } from '@/app/components/OnboardingTour';
import { CookieBanner } from '@/app/components/CookieBanner';
import { ArchipelagoRail, type ArchipelagoData } from './components/ArchipelagoRail';
import { COMPACT_WIDTH, MapStage } from './components/MapStage';
import { Readout } from './components/Readout';
import { SidePanel } from './components/SidePanel';
import { formatLongDate, formatTime, useNow } from './lib/format';
import {
  ARCHIPELAGO_CODES,
  ARCHIPELAGOS,
  useCommunesGeo,
  useDashboardData,
  useSaintMartinGeo,
  type Layer,
} from './lib/model';
import {
  vigilanceColor,
  vigilanceLabel,
} from './lib/palette';

/**
 * Couche affichée et commune choisie vivent dans l'URL : `?commune=97118&vue=eau`.
 * Les valeurs sont en français : l'adresse se lit et se partage.
 */
const LAYER_BY_PARAM: Record<string, Layer> = { air: 'air', eau: 'water' };
const PARAM_BY_LAYER: Record<Layer, string> = { air: 'air', water: 'eau' };

/** Bascule clair/sombre adaptée au dashboard (pas de Tailwind ici). */
function DashboardThemeToggle() {
  /*
   * `resolvedTheme` et non `theme` : avec `defaultTheme="system"`, `theme`
   * vaut « system » et jamais « dark ». Sur un système en sombre, le bouton
   * proposait donc de passer en sombre alors que la page l'était déjà, et le
   * premier clic ne changeait rien à l'écran.
   *
   * Avant montage, `resolvedTheme` est indéfini : on s'aligne sur le thème par
   * défaut de la feuille de style, qui est le clair.
   */
  const { resolvedTheme, setTheme } = useTheme();
  const dark = useMounted() && resolvedTheme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle-dashboard"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Passer en thème clair' : 'Passer en thème sombre'}
      title={dark ? 'Passer en thème clair' : 'Passer en thème sombre'}
    >
      {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}

export default function DashboardClient() {
  const { geo, error: geoError } = useCommunesGeo();
  // Saint-Martin (978) n'appartient pas au département : sa forme vient d'un
  // second fichier, tenue à l'écart de la carte principale (voir MapStage,
  // qui ne reçoit que `geo`) et assemblée seulement pour le rail des archipels.
  const { geo: saintMartinGeo, error: saintMartinError } = useSaintMartinGeo();
  const saintMartinFeature = saintMartinGeo?.features[0] ?? null;
  // Les deux contours arrivent par deux requêtes distinctes : tant que celle de
  // Saint-Martin n'a pas abouti, un `?commune=97801` ne désigne encore rien.
  const geoSettled = (geo !== null || geoError !== null) &&
    (saintMartinGeo !== null || saintMartinError !== null);
  const now = useNow();
  const data = useDashboardData(geo, saintMartinFeature, now);

  // Les Saintes, Marie-Galante et La Désirade vivent désormais dans le rail,
  // sur leur propre carte : les revoir en miniature sur la carte principale
  // les montrerait deux fois. Saint-Martin n'y a jamais figuré, hors du
  // département qu'elle projette.
  const mainlandGeo = React.useMemo(() => {
    if (!geo) return geo;
    return { ...geo, features: geo.features.filter((f) => !ARCHIPELAGO_CODES.has(f.properties.code)) };
  }, [geo]);

  const archipelagoGroups = React.useMemo<ArchipelagoData[]>(() => {
    const byFeatureCode = new Map(
      [...(geo?.features ?? []), ...(saintMartinGeo?.features ?? [])].map((feature) => [
        feature.properties.code,
        feature,
      ]),
    );
    return ARCHIPELAGOS.map((group) => ({
      ...group,
      features: group.codes
        .map((code) => byFeatureCode.get(code))
        .filter((feature): feature is NonNullable<typeof feature> => Boolean(feature)),
    })).filter((group) => group.features.length > 0);
  }, [geo, saintMartinGeo]);

  const [layer, setLayer] = React.useState<Layer>('air');
  const [selected, setSelected] = React.useState<string | null>(null);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [online, setOnline] = React.useState(true);
  /*
   * L'URL est lue après montage, pas pendant le rendu : le serveur prérend la
   * page sans connaître les paramètres, et lire `window.location` dès le
   * premier rendu produirait un écart d'hydratation.
   */
  const [urlRead, setUrlRead] = React.useState(false);

  /*
   * Dette assumée : `react-hooks/set-state-in-effect` désapprouve ce report de
   * l'URL vers l'état, et il a formellement raison. Les sorties propres coûtent
   * toutes plus cher qu'elles ne rapportent ici :
   *  - `useSearchParams` de Next ferait basculer la page en rendu dynamique (ou
   *    imposerait une frontière Suspense), pour un paramètre lu une seule fois ;
   *  - un `useSyncExternalStore` sur `window.location` relirait l'adresse à
   *    chaque rendu, y compris celles que le `replaceState` ci-dessous vient
   *    d'écrire : l'URL se réappliquerait par-dessus le choix de l'utilisateur.
   * À reprendre le jour où la sélection déménage dans le routeur.
   */
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- voir ci-dessus */
    const params = new URLSearchParams(window.location.search);
    const commune = params.get('commune');
    if (commune && /^\d{5}$/.test(commune)) setSelected(commune);
    const parsed = LAYER_BY_PARAM[params.get('vue') ?? ''];
    if (parsed) setLayer(parsed);
    setUrlRead(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const searchRef = React.useRef<HTMLInputElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  // Saint-Martin n'est pas dans `byCode` (elle ne fait pas partie des 32
  // communes) : on la retrouve à part si c'est elle qui est sélectionnée.
  const selectedCommune = selected
    ? data.byCode.get(selected) ??
      (data.saintMartin?.code === selected ? data.saintMartin : null)
    : null;

  const railByCode = React.useMemo(() => {
    if (!data.saintMartin) return data.byCode;
    const map = new Map(data.byCode);
    map.set(data.saintMartin.code, data.saintMartin);
    return map;
  }, [data.byCode, data.saintMartin]);

  /*
   * Un code venu de l'URL peut ne désigner aucune commune (faute de frappe,
   * ancien lien) : on retombe alors sur la vue d'ensemble plutôt que de
   * laisser la page en état incohérent.
   *
   * Dérivé au rendu, et non remis à zéro depuis un effet : `setState` en effet
   * coûte un rendu de plus et React le décourage désormais. Tant que rien
   * n'est arrivé, le code est conservé — sans quoi un lien profond serait
   * abandonné avant que sa commune ait eu une chance d'exister. La fenêtre se
   * referme dès la première livraison : un rafraîchissement ultérieur ne doit
   * pas faire réapparaître dans l'URL un code déjà jugé invalide.
   */
  const resolving = !geoSettled || (data.loading && data.communes.length === 0);
  const activeCode = selected && (selectedCommune !== null || resolving) ? selected : null;

  // `replaceState` plutôt que `pushState` : cliquer dix communes de suite ne
  // doit pas remplir l'historique de dix entrées, mais l'adresse doit rester
  // copiable à tout moment.
  React.useEffect(() => {
    if (!urlRead) return;
    const params = new URLSearchParams(window.location.search);
    if (activeCode) params.set('commune', activeCode);
    else params.delete('commune');
    if (layer === 'air') params.delete('vue');
    else params.set('vue', PARAM_BY_LAYER[layer]);
    const search = params.toString();
    window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname);
  }, [urlRead, activeCode, layer]);

  // Sélectionner une commune remplit le panneau : plus de couche superposée,
  // la carte reste lisible pendant la consultation.
  const select = React.useCallback((code: string) => {
    setSelected(code);
    setQuery('');
  }, []);

  /**
   * Revenir à toute l'île. Trois chemins y mènent — le logo, un clic sur la
   * mer, la touche Échap — parce qu'aucun n'est deviné par tout le monde.
   */
  const clear = React.useCallback(() => setSelected(null), []);

  /*
   * En repli, le panneau passe sous la carte : choisir une commune sur la
   * carte remplissait une fiche restée hors de l'écran. On l'y amène. Sur
   * grand écran elle est déjà visible à droite — rien à faire.
   */
  React.useEffect(() => {
    if (!activeCode || window.innerWidth >= COMPACT_WIDTH) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panelRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    panelRef.current?.focus({ preventScroll: true });
  }, [activeCode]);

  // Bandeau hors-ligne : le cache localStorage prend le relais, on l'annonce.
  React.useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  /*
   * Deux raccourcis, ceux qu'on attend d'une carte : « / » pour chercher,
   * « Échap » pour revenir à toute l'île. Sans eux, parcourir trente-deux
   * communes au clavier obligeait à retraverser la page à chaque fois.
   */
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      if (event.key === 'Escape') {
        if (typing && query) {
          setQuery('');
          return;
        }
        setSelected(null);
        return;
      }

      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [query]);

  /*
   * Une seule expression pour deux décisions : afficher la fiche dans le
   * panneau, et rétrograder le titre d'accueil en paragraphe. Elles étaient
   * calculées séparément ici et dans SidePanel, avec des conditions
   * différentes — commune choisie *et* recherche en cours, la fiche
   * disparaissait, le titre restait en `<p>`, et la page n'avait plus de `h1`.
   */
  const showDetail = selectedCommune !== null && query.trim().length === 0;

  const stamp = now ? `${formatTime(now)} — ${formatLongDate(now)}` : '';
  const vigilanceLevel = data.vigilance?.level ?? null;
  const vigilanceUpdated =
    data.vigilance?.last_update != null
      ? formatTime(new Date(data.vigilance.last_update))
      : null;
  const vigilanceAlert = vigilanceLevel != null && vigilanceLevel >= 3;

  return (
    <div className="shell">
      <a className="skip-link" href="#commune-search">
        Aller à la liste des communes
      </a>
      <OnboardingTour />
      <CookieBanner />
      {/*
        Les deux bannières s'empilent dans un conteneur positionné (voir
        `.banner-stack`) : posées en absolu par style inline alors que
        `.shell` n'était pas positionné, elles se calaient sur le bloc
        conteneur initial et passaient sous le tutoriel d'accueil.
      */}
      <div className="banner-stack">
        {!online && (
          <div className="banner-error banner-offline" role="status">
            Hors-ligne — données en cache affichées.
          </div>
        )}
        {data.error && (
          <div className="banner-error" role="alert">
            <span>Données indisponibles ({data.error}).</span>
            <button type="button" onClick={data.retry}>
              Réessayer
            </button>
          </div>
        )}
      </div>
      <main className="stage">
        <MapStage
          geo={mainlandGeo}
          geoError={geoError}
          byCode={data.byCode}
          layer={layer}
          selected={activeCode}
          hovered={hovered}
          onHover={setHovered}
          onSelect={select}
          onClear={clear}
        />

        {/*
          Les blocs posés sur la carte, dans une grille plutôt qu'en six
          positions absolues calées à la main : le rail des archipels
          démarrait à un `top: 168px` qui était la somme mesurée à l'œil des
          hauteurs de la marque et du texte d'accueil, et il recouvrait le
          readout dès que la fenêtre devenait courte. Il occupe maintenant la
          rangée souple de la grille et défile en lui-même quand la place
          manque.

          L'ordre du DOM suit désormais l'ordre visuel : la marque venait
          après le texte d'accueil tout en s'affichant au-dessus.
        */}
        <div className="stage-overlay">
          <header className="brand-bar">
            {/*
              Le logo est aussi le retour à la vue d'ensemble — la place qu'on
              cherche d'instinct pour « revenir à l'accueil ». Il reste un
              bouton même sans sélection : cliquer sur le nom du site et ne
              rien voir se passer n'apprend rien de plus qu'un retour à un état
              déjà en cours.
            */}
            <button
              type="button"
              className="brand"
              onClick={clear}
              aria-label="Gwad'Alerte — revenir à toute la Guadeloupe"
            >
              Gwad&apos;Alerte
            </button>
            <p className="brand-meta mono">
              {selectedCommune ? selectedCommune.nom : `${data.communes.length || 32} communes`}
              {stamp && ` · ${stamp}`}
            </p>
          </header>

          {/* Actions en haut à droite : bascule de thème puis vigilance
              départementale, qui vit hors de la carte. Alerte montante au
              niveau orange/rouge, avec heure de relevé. */}
          <div className="top-actions">
            <DashboardThemeToggle />
            <div
              className={`vigilance-banner${vigilanceLevel != null ? ` level-${vigilanceLevel}` : ''}`}
              role={vigilanceAlert ? 'alert' : 'status'}
            >
              <span
                className="dot"
                style={{ background: vigilanceColor(vigilanceLevel) }}
                aria-hidden="true"
              />
              <span className="level">
                Vigilance {vigilanceLabel(vigilanceLevel).toLowerCase()}
              </span>
              <span className="scope mono">
                Toute la Guadeloupe{vigilanceUpdated ? ` · MAJ ${vigilanceUpdated}` : ''}
              </span>
            </div>
          </div>

          {/* Texte d'accueil explicatif. Un seul `h1` par page : quand une
              fiche commune (qui porte son propre `h1`) est ouverte, ce titre
              repasse en paragraphe. */}
          <div className="welcome-note">
            {showDetail ? (
              <p className="welcome-title">Tableau de bord citoyen</p>
            ) : (
              <h1 className="welcome-title">Tableau de bord citoyen</h1>
            )}
            <p className="welcome-text">
              Qualité de l&apos;air, météo et coupures d&apos;eau des 32 communes de Guadeloupe.
              Cliquez une commune sur la carte ou cherchez son nom.
            </p>
          </div>

          <ArchipelagoRail
            groups={archipelagoGroups}
            byCode={railByCode}
            layer={layer}
            selected={activeCode}
            hovered={hovered}
            onHover={setHovered}
            onSelect={select}
          />

          <Readout
            communes={data.communes}
            loading={data.loading && data.communes.length === 0}
          />
        </div>
      </main>

      <SidePanel
        communes={data.communes}
        selected={selectedCommune}
        layer={layer}
        query={query}
        showDetail={showDetail}
        loading={data.loading}
        now={now}
        hovered={hovered}
        onHover={setHovered}
        onLayerChange={setLayer}
        onQueryChange={setQuery}
        onSelect={select}
        searchRef={searchRef}
        detailRef={panelRef}
      />

      {/* `next/link` et non `<a>` : aller aux mentions légales rechargeait
          toute l'application. */}
      <footer className="dashboard-footer">
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/credits">Crédits</Link>
        <span>© {new Date().getFullYear()} Gwad&apos;Alerte</span>
      </footer>
    </div>
  );
}
