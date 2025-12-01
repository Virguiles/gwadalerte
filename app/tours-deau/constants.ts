import { CommuneColors } from './types';

export const COMMUNE_COLORS: { [key: string]: CommuneColors } = {
  'LES ABYMES': { primary: '#3B82F6', light: '#DBEAFE', border: '#2563EB' }, // Bleu
  'SAINTE-ANNE': { primary: '#10B981', light: '#D1FAE5', border: '#059669' }, // Vert
  'SAINT-FRANÇOIS': { primary: '#F59E0B', light: '#FEF3C7', border: '#D97706' }, // Orange
  'LE GOSIER': { primary: '#8B5CF6', light: '#EDE9FE', border: '#7C3AED' }, // Violet
  'GOYAVE': { primary: '#EC4899', light: '#FCE7F3', border: '#DB2777' }, // Rose
  'SAINTE-ROSE': { primary: '#06B6D4', light: '#CFFAFE', border: '#0891B2' }, // Cyan
  'CAPESTERRE-BELLE-EAU': { primary: '#F97316', light: '#FFEDD5', border: '#EA580C' }, // Orange foncé
  'TERRE-DE-HAUT (LES SAINTES)': { primary: '#14B8A6', light: '#CCFBF1', border: '#0D9488' }, // Turquoise
  'TERRE-DE-BAS (LES SAINTES)': { primary: '#14B8A6', light: '#CCFBF1', border: '#0D9488' },
  'TROIS-RIVIÈRES': { primary: '#EF4444', light: '#FEE2E2', border: '#DC2626' }, // Rouge
  'GOURBEYRE': { primary: '#84CC16', light: '#ECFCCB', border: '#65A30D' }, // Vert lime
  'SAINT-CLAUDE': { primary: '#A855F7', light: '#F3E8FF', border: '#9333EA' }, // Violet foncé
  'LA DÉSIRADE': { primary: '#0EA5E9', light: '#E0F2FE', border: '#0284C7' }, // Bleu ciel
};

export const COLOR_PALETTE: CommuneColors[] = [
  { primary: '#22C55E', light: '#DCFCE7', border: '#16A34A' }, // Vert émeraude
  { primary: '#FBBF24', light: '#FEF3C7', border: '#F59E0B' }, // Jaune
  { primary: '#FB7185', light: '#FFE4E6', border: '#F43F5E' }, // Rose foncé
  { primary: '#34D399', light: '#D1FAE5', border: '#10B981' }, // Vert menthe
  { primary: '#F472B6', light: '#FCE7F3', border: '#EC4899' }, // Rose
  { primary: '#60A5FA', light: '#DBEAFE', border: '#3B82F6' }, // Bleu clair
  { primary: '#A78BFA', light: '#EDE9FE', border: '#8B5CF6' }, // Violet clair
  { primary: '#F87171', light: '#FEE2E2', border: '#EF4444' }, // Rouge clair
  { primary: '#4ADE80', light: '#D1FAE5', border: '#22C55E' }, // Vert clair
  { primary: '#38BDF8', light: '#E0F2FE', border: '#0EA5E9' }, // Bleu ciel clair
];
