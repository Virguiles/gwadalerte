import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales - Gwad'Alerte",
  description: "Mentions légales du site Gwad'Alerte. Éditeur, hébergement, propriété intellectuelle et avertissement sur l'utilisation des données environnementales.",
  keywords: ["mentions légales", "Gwad'Alerte", "éditeur", "hébergement", "RGPD", "données personnelles", "responsabilité"],
  authors: [{ name: "Virgile" }],
  creator: "Virgile",
  publisher: "Gwad'Alerte",
  openGraph: {
    title: "Mentions Légales - Gwad'Alerte",
    description: "Informations légales sur l'utilisation du site Gwad'Alerte et des données environnementales.",
    url: "https://gwadalerte.com/mentions-legales",
    siteName: "Gwad'Alerte",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mentions Légales - Gwad'Alerte",
    description: "Informations légales sur Gwad'Alerte.",
  },
  alternates: {
    canonical: "https://gwadalerte.com/mentions-legales",
  },
};

export default function MentionsLegales() {
  return (
    <div className="px-4 py-12 sm:px-6">
      <div className="max-w-xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Mentions Légales</h1>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Éditeur du site</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le site <strong>Gwad&apos;Alerte</strong> est édité à titre personnel par <strong>Virgile</strong>, développeur web indépendant.
              <br />
              Site web : <a href="https://virgile.site/" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">https://virgile.site/</a>
              <br />
              <br />
              <strong>Contact :</strong> Pour toute question ou réclamation, veuillez utiliser l&apos;adresse e-mail suivante : <a href="mailto:hello@virgilepopote.com" className="text-link underline underline-offset-2">hello@virgilepopote.com</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Hébergement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ce site est hébergé par la société <strong>Vercel Inc.</strong>
              <br />
              Adresse : 340 S Lemon Ave #4133 Walnut, CA 91789, USA.
              <br />
              Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">https://vercel.com</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur et la propriété intellectuelle.
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              La reproduction de tout ou partie de ce site sur un support électronique quel qu&apos;il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Avertissement et Responsabilité</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Gwad&apos;Alerte est un tableau de bord citoyen non officiel.</strong>
              <br />
              Les informations fournies (qualité de l&apos;air, météo, vigilance, tours d&apos;eau) sont agrégées à partir de sources externes et affichées à <strong>titre informatif uniquement</strong>. L&apos;éditeur ne peut garantir l&apos;exactitude, la complétude, la fiabilité ou l&apos;actualité des données.
              <br /><br />
              <strong>En cas d&apos;alerte météorologique ou cyclonique (Vigilance), ou de risque sanitaire (Qualité de l&apos;Air), l&apos;utilisateur doit impérativement consulter les canaux de communication officiels des autorités compétentes.</strong>
              <br /><br />
              L&apos;éditeur de Gwad&apos;Alerte décline toute responsabilité quant aux décisions prises ou non prises par l&apos;utilisateur sur la base des informations consultées sur ce site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Sources de Données Externes</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ce site agrège et affiche des données provenant des organismes suivants, qui en conservent la pleine propriété intellectuelle et la responsabilité de leur exactitude :
            </p>
            <ul className="list-disc ml-6 text-muted-foreground leading-relaxed space-y-2">
              <li><strong>Qualité de l&apos;Air :</strong> Données fournies par <a href="http://www.gwadair.fr/" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">Gwad&apos;Air</a> .</li>
              <li><strong>Météo et Prévisions :</strong> Données fournies par <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">Open Meteo</a> .</li>
              <li><strong>Vigilance Météo :</strong> Données officielles fournies par <a href="https://meteofrance.fr/" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">Météo-France</a>.</li>
              <li><strong>Tours d&apos;eau :</strong> Planning fourni par la <a href="https://www.smgeag.fr/" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">SMGEAG</a>.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Données personnelles (RGPD) et stockage local</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le site Gwad&apos;Alerte ne collecte aucune donnée personnelle d&apos;identification (nom, e-mail, etc.).
            </p>
            <ul className="list-disc ml-6 text-muted-foreground leading-relaxed space-y-2">
              <li><strong>Aucun cookie :</strong> le site n&apos;en dépose aucun, et n&apos;utilise aucun outil de mesure d&apos;audience tiers.</li>
              <li><strong>Stockage local :</strong> votre navigateur conserve votre choix de thème, votre progression dans les messages d&apos;aide, ainsi qu&apos;une copie des dernières données de météo, de qualité de l&apos;air et de tours d&apos;eau reçues — cette copie permet de consulter le site hors ligne. Ces informations ne quittent jamais votre appareil et disparaissent si vous effacez les données du site dans votre navigateur.</li>
              <li><strong>Statistiques d&apos;hébergement :</strong> l&apos;hébergeur Vercel peut relever des données d&apos;usage agrégées (pages vues, temps de réponse) à des fins de performance et de sécurité.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
