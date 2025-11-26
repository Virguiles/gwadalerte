import Link from 'next/link';

export default function MentionsLegales() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Mentions Légales</h1>
          <p className="text-slate-600 dark:text-gray-400">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">1. Éditeur du site</h2>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              Le site <strong>Gwad'Alerte</strong> est édité à titre personnel par <strong>Virgile</strong>, développeur web indépendant.
              <br />
              Site web : <a href="https://virgile.site/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://virgile.site/</a>
            </p>
          </section>

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

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">3. Propriété intellectuelle</h2>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">4. Responsabilité</h2>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              Les informations fournies sur Gwad'Alerte le sont à titre indicatif. L'éditeur ne saurait garantir l'exactitude, la complétude, l'actualité des informations diffusées sur le site.
              En conséquence, l'utilisateur reconnaît utiliser ces informations sous sa responsabilité exclusive.
              Gwad'Alerte ne peut être tenu responsable des erreurs ou omissions, d'une absence de disponibilité des informations et des services.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
