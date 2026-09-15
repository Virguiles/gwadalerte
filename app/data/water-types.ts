export type WaterCutDetail = {
  secteur: string;
  horaires: string;
  zones_alimentation_favorables?: string;
};

export type WaterCutData = {
  commune: string;
  details: WaterCutDetail[];
  /**
   * Date de relevé de CE planning commune par commune — pas la date globale
   * du dernier appel réseau. Orisk et le repli SMGEAG n'ont pas la même
   * fraîcheur : sans ce champ, une commune servie par le relevé statique
   * (parfois vieux de plusieurs semaines) hérite à tort de la date « à
   * l'instant » d'Orisk dès que l'API répond pour n'importe quelle autre
   * commune.
   */
  collectedAt?: string;
};

export type WaterDataMap = {
  [code_zone: string]: WaterCutData;
};

export type DateFilter = 'today' | 'tomorrow' | 'week';
