// Utilitaires couleur pour uniformiser le rendu sans toucher au design
export function hexToRgba(hex?: string, alpha = 0.15, fallback = '#50F0E6') {
  const safeHex = hex && hex.startsWith('#') ? hex : fallback;
  const r = parseInt(safeHex.slice(1, 3), 16);
  const g = parseInt(safeHex.slice(3, 5), 16);
  const b = parseInt(safeHex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
