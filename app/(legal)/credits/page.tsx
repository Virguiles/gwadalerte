import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crédits & Sources - Gwad'Alerte",
  description: "Découvrez les sources de données officielles utilisées par Gwad'Alerte : Météo-France, Gwad'Air, Orisk et Open-Meteo. Transparence sur les ressources et licences.",
  keywords: ["crédits Gwad'Alerte", "sources données", "Météo-France", "Gwad'Air", "Orisk", "Open-Meteo", "licences", "transparence"],
  authors: [{ name: "Virgile" }],
  creator: "Virgile",
  publisher: "Gwad'Alerte",
  openGraph: {
    title: "Crédits & Sources - Gwad'Alerte",
    description: "Sources officielles et ressources utilisées pour les données environnementales de Guadeloupe.",
    url: "https://gwadalerte.com/credits",
    siteName: "Gwad'Alerte",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Crédits & Sources - Gwad'Alerte",
    description: "Sources de données officielles pour Gwad'Alerte.",
  },
  alternates: {
    canonical: "https://gwadalerte.com/credits",
  },
};

export default function Credits() {
  return (
    <div className="px-4 py-12 sm:px-6">
      <div className="max-w-xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Crédits & Sources</h1>
          <p className="text-muted-foreground">Transparence sur les données et ressources utilisées</p>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Sources de Données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ce site agrège et affiche des données provenant des organismes suivants, qui en conservent la pleine propriété intellectuelle et la responsabilité de leur exactitude :
            </p>
            <ul className="list-disc ml-6 text-muted-foreground leading-relaxed space-y-2">
              <li><strong>Météo-France :</strong> Données officielles de vigilance météorologique et bulletins publics (<a href="https://meteofrance.fr/" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">meteofrance.fr</a> via leur API).</li>
              <li><strong>Gwad&apos;Air :</strong> Indices de qualité de l&apos;air (ATMO) fournis par l&apos;association agréée de surveillance de la qualité de l&apos;air en Guadeloupe (<a href="http://www.gwadair.fr/" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">gwadair.fr</a> via leur API).</li>
              <li><strong>Open Meteo :</strong> Données météorologiques et prévisions complémentaires (<a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">open-meteo.com</a>).</li>
              <li><strong>Orisk :</strong> Planning des tours d&apos;eau pour la Guadeloupe (<a href="https://orisk.app/" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">orisk.app</a>), à partir des publications de la <a href="https://www.smgeag.fr/" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">SMGEAG</a>. Réutilisation libre, sous réserve de citer Orisk.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Ressources Graphiques</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les ressources visuelles utilisées sur ce site proviennent des sources suivantes :
            </p>
            <ul className="list-disc ml-6 text-muted-foreground leading-relaxed space-y-2">
              <li><strong>Icônes météo :</strong> dessinées pour ce site, sous forme de SVG en couleur (soleil, lune, pluie, orage, brume).</li>
              <li><strong>Autres icônes :</strong> librairie <a href="https://lucide.com/" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">Lucide</a>.</li>
              <li><strong>Contours des communes :</strong> <a href="https://geo.api.gouv.fr/" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">API Découpage administratif</a> (IGN, Admin Express).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Avertissement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ce site est un projet indépendant et n&apos;est pas affilié directement aux organismes cités ci-dessus.
              Les données sont utilisées dans le respect des licences Open Data disponibles.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
