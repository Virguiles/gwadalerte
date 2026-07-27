import type { Metadata } from "next";
import ToursDeauClient from './ToursDeauClient';

export const metadata: Metadata = {
  title: "Tours d'Eau Guadeloupe - Coupures Programmées | Gwad'Alerte",
  description: "Calendrier des coupures d'eau programmées en Guadeloupe. Planning SMGEAG par commune, avec la date de relevé du document. Évitez les mauvaises surprises !",
  keywords: ["tours d'eau Guadeloupe", "coupures eau", "planning SMGEAG", "arrêts eau programmés", "distribution eau", "communes Guadeloupe", "calendrier coupures"],
  authors: [{ name: "Virgile" }],
  creator: "Virgile",
  publisher: "Gwad'Alerte",
  openGraph: {
    title: "Tours d'Eau Guadeloupe - Planning des coupures programmées",
    description: "Consultez le calendrier des arrêts d'eau programmés par commune en Guadeloupe. Planning officiel SMGEAG, daté et vérifiable.",
    url: "https://gwadalerte.com/tours-deau",
    siteName: "Gwad'Alerte",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tours d'Eau Guadeloupe - Coupures Programmées",
    description: "Planning des arrêts d'eau programmés pour votre commune. Évitez les interruptions de service.",
  },
  alternates: {
    canonical: "https://gwadalerte.com/tours-deau",
  },
};

export default function WaterMapPage() {
  return <ToursDeauClient />;
}
