import type { Metadata } from "next";
import HomeClient from './HomeClient';

// Composant pour les données structurées SEO (JSON-LD)
const HomeJsonLd = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Gwad\'Alerte',
    description: 'Tableau de bord citoyen pour surveiller l\'eau, l\'air et la météo en Guadeloupe',
    url: 'https://gwadalerte.com',
    applicationCategory: 'Environment',
    operatingSystem: 'Web Browser',
    offers: [
      {
        '@type': 'Offer',
        category: 'Environmental Monitoring',
        description: 'Surveillance de la qualité de l\'air en Guadeloupe'
      },
      {
        '@type': 'Offer',
        category: 'Weather Information',
        description: 'Prévisions météorologiques et vigilance pour toutes les communes'
      },
      {
        '@type': 'Offer',
        category: 'Water Management',
        description: 'Calendrier des coupures d\'eau programmées'
      }
    ],
    creator: {
      '@type': 'Person',
      name: 'Virgile'
    },
    provider: {
      '@type': 'Organization',
      name: 'Gwad\'Alerte',
      url: 'https://gwadalerte.com'
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Guadeloupe'
    },
    dataSource: [
      {
        '@type': 'Organization',
        name: 'Météo-France',
        url: 'https://meteofrance.fr'
      },
      {
        '@type': 'Organization',
        name: 'Gwad\'Air',
        url: 'https://www.gwadair.fr'
      },
      {
        '@type': 'Organization',
        name: 'SMGEAG',
        url: 'https://www.smgeag.fr'
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export const metadata: Metadata = {
  title: "Gwad'Alerte - Tableau de bord environnemental Guadeloupe | Eau, Air, Météo",
  description: "Consultez en temps réel la qualité de l'air, les tours d'eau, la météo et les vigilances en Guadeloupe. Données officielles de Gwad'Air, Météo-France et SMGEAG pour votre commune.",
  keywords: ["Guadeloupe", "qualité air", "tours d'eau", "météo", "vigilance", "ATMO", "polluants", "coupures eau", "prévisions", "environnement"],
  authors: [{ name: "Virgile" }],
  creator: "Virgile",
  publisher: "Gwad'Alerte",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Gwad'Alerte - Informations environnementales Guadeloupe",
    description: "Tableau de bord citoyen pour surveiller eau, air et météo en Guadeloupe. Données temps réel pour toutes vos communes.",
    url: "https://gwadalerte.com",
    siteName: "Gwad'Alerte",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gwad'Alerte - Carte interactive de la Guadeloupe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gwad'Alerte - Infos environnementales Guadeloupe",
    description: "Surveillez qualité de l'air, tours d'eau et météo en temps réel pour votre commune en Guadeloupe.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://gwadalerte.com",
  },
};

export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <HomeClient />
    </>
  );
}
