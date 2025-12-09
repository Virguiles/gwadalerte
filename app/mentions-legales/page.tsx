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
    <main className="min-h-screen bg-white dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Mentions Légales</h1>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">1. Éditeur du site</h2>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              Le site <strong>Gwad&apos;Alerte</strong> est édité à titre personnel par <strong>Virgile</strong>, développeur web indépendant.
              <br />
              Site web : <a href="https://virgile.site/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://virgile.site/</a>
              <br />
              <br />
              <strong>Contact :</strong> Pour toute question ou réclamation, veuillez utiliser l&apos;adresse e-mail suivante : [votre-email-de-contact]@exemple.com
            </p>
          </section>
<br />
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">2. Hébergement</h2>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              Ce site est hébergé par la société <strong>Vercel Inc.</strong>
              <br />
              Adresse : 340 S Lemon Ave #4133 Walnut, CA 91789, USA.
              <br />
              Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://vercel.com</a>
            </p>
          </section>
<br />
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">3. Propriété intellectuelle</h2>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur et la propriété intellectuelle.
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              La reproduction de tout ou partie de ce site sur un support électronique quel qu&apos;il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
            </p>
          </section>
<br />
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">4. Avertissement et Responsabilité</h2>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              <strong>Gwad&apos;Alerte est un tableau de bord citoyen non officiel.</strong>
              <br />
              Les informations fournies (qualité de l&apos;air, météo, vigilance, tours d&apos;eau) sont agrégées à partir de sources externes et affichées à **titre informatif uniquement**. L&apos;éditeur ne peut garantir l&apos;exactitude, la complétude, la fiabilité ou l&apos;actualité des données.
              <br /><br />
              <strong>En cas d&apos;alerte météorologique ou cyclonique (Vigilance), ou de risque sanitaire (Qualité de l&apos;Air), l&apos;utilisateur doit impérativement consulter les canaux de communication officiels des autorités compétentes.</strong>
              <br /><br />
              L&apos;éditeur de Gwad&apos;Alerte décline toute responsabilité quant aux décisions prises ou non prises par l&apos;utilisateur sur la base des informations consultées sur ce site.
            </p>
          </section>
<br />
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">5. Sources de Données Externes</h2>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              Ce site agrège et affiche des données provenant des organismes suivants, qui en conservent la pleine propriété intellectuelle et la responsabilité de leur exactitude :
            </p>
            <ul className="list-disc ml-6 text-slate-600 dark:text-gray-300 leading-relaxed space-y-2">
              <li><strong>Qualité de l&apos;Air :</strong> Données fournies par <a href="http://www.gwadair.fr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Gwad&apos;Air</a> .</li>
              <li><strong>Météo et Prévisions :</strong> Données fournies par <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open Meteo</a> .</li>
              <li><strong>Vigilance Météo :</strong> Données officielles fournies par <a href="https://meteofrance.fr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Météo-France</a>.</li>
              <li><strong>Tours d&apos;eau :</strong> Planning fourni par la <a href="https://www.smgeag.fr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SMGEAG</a>.</li>
            </ul>
          </section>
<br />
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">6. Données Personnelles (RGPD) et Cookies</h2>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              Le site Gwad&apos;Alerte ne collecte aucune donnée personnelle d&apos;identification (nom, e-mail, etc.).
            </p>
            <ul className="list-disc ml-6 text-slate-600 dark:text-gray-300 leading-relaxed space-y-2">
              <li><strong>Statistiques :</strong> Des données d&apos;usage anonymes (pages vues, durée de session) peuvent être collectées par l&apos;hébergeur Vercel pour des raisons de performance.</li>
              <li><strong>Cookies :</strong> Le site utilise un cookie uniquement pour enregistrer la préférence de l&apos;utilisateur concernant le mode d&apos;affichage. Ce cookie ne contient aucune donnée personnelle.</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
