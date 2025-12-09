import type { Metadata } from "next";
import QualiteAirClient from './QualiteAirClient';

export const metadata: Metadata = {
  title: "Qualité de l'Air Guadeloupe - Indice ATMO & Polluants | Gwad'Alerte",
  description: "Consultez l'indice ATMO et les concentrations de polluants en temps réel pour toutes les communes de Guadeloupe. Recommandations sanitaires et données officielles Gwad'Air.",
  keywords: ["qualité air Guadeloupe", "indice ATMO", "polluants", "PM10", "PM2.5", "ozone", "dioxyde azote", "Gwad'Air", "recommandations sanitaires", "communes Guadeloupe"],
  authors: [{ name: "Virgile" }],
  creator: "Virgile",
  publisher: "Gwad'Alerte",
  openGraph: {
    title: "Qualité de l'Air Guadeloupe - Indice ATMO par commune",
    description: "Carte interactive de l'indice ATMO et concentrations de polluants. Recommandations sanitaires pour votre santé selon la qualité de l'air local.",
    url: "https://gwadalerte.com/qualite-air",
    siteName: "Gwad'Alerte",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image-air.jpg",
        width: 1200,
        height: 630,
        alt: "Carte de qualité de l'air Guadeloupe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qualité Air Guadeloupe - ATMO & Polluants",
    description: "Indice ATMO et polluants en temps réel pour toutes les communes de Guadeloupe.",
    images: ["/og-image-air.jpg"],
  },
  alternates: {
    canonical: "https://gwadalerte.com/qualite-air",
  },
};

export default function QualiteAir() {
  return <QualiteAirClient />;
}
