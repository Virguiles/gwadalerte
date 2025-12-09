import type { Metadata } from "next";
import MeteoClient from './MeteoClient';

export const metadata: Metadata = {
  title: "Météo Guadeloupe - Prévisions & Vigilance | Gwad'Alerte",
  description: "Consultez les prévisions météorologiques détaillées et les niveaux de vigilance officiels pour toutes les communes de Guadeloupe. Données temps réel de Météo-France et Open-Meteo.",
  keywords: ["météo Guadeloupe", "prévisions", "vigilance météo", "température", "pluie", "vent", "cyclone", "Météo-France", "bulletins vigilance", "communes Guadeloupe"],
  authors: [{ name: "Virgile" }],
  creator: "Virgile",
  publisher: "Gwad'Alerte",
  openGraph: {
    title: "Météo & Vigilance Guadeloupe - Prévisions par commune",
    description: "Carte interactive des conditions météo et niveaux de vigilance pour votre commune. Prévisions 3 jours, alertes cycloniques et données officielles.",
    url: "https://gwadalerte.com/meteo",
    siteName: "Gwad'Alerte",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image-meteo.jpg",
        width: 1200,
        height: 630,
        alt: "Carte météo interactive de la Guadeloupe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Météo Guadeloupe - Vigilance & Prévisions",
    description: "Prévisions météo détaillées et vigilance officielle pour toutes les communes de Guadeloupe.",
    images: ["/og-image-meteo.jpg"],
  },
  alternates: {
    canonical: "https://gwadalerte.com/meteo",
  },
};

export default function MeteoPage() {
  return <MeteoClient />;
}
