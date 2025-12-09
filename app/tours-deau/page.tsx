import type { Metadata } from "next";
import ToursDeauClient from './ToursDeauClient';

export const metadata: Metadata = {
  title: "Tours d'Eau Guadeloupe - Coupures Programmées | Gwad'Alerte",
  description: "Calendrier des coupures d'eau programmées en Guadeloupe. Planning SMGEAG en temps réel pour toutes les communes. Évitez les mauvaises surprises !",
  keywords: ["tours d'eau Guadeloupe", "coupures eau", "planning SMGEAG", "arrêts eau programmés", "distribution eau", "communes Guadeloupe", "calendrier coupures"],
  authors: [{ name: "Virgile" }],
  creator: "Virgile",
  publisher: "Gwad'Alerte",
  openGraph: {
    title: "Tours d'Eau Guadeloupe - Planning des coupures programmées",
    description: "Consultez le calendrier des arrêts d'eau programmés par commune en Guadeloupe. Données officielles SMGEAG mises à jour en temps réel.",
    url: "https://gwadalerte.com/tours-deau",
    siteName: "Gwad'Alerte",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image-water.jpg",
        width: 1200,
        height: 630,
        alt: "Calendrier des tours d'eau Guadeloupe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tours d'Eau Guadeloupe - Coupures Programmées",
    description: "Planning des arrêts d'eau programmés pour votre commune. Évitez les interruptions de service.",
    images: ["/og-image-water.jpg"],
  },
  alternates: {
    canonical: "https://gwadalerte.com/tours-deau",
  },
};

export default function WaterMapPage() {
  return <ToursDeauClient />;
}
