export type WaterCutDetail = {
  secteur: string;
  horaires: string;
  zones_alimentation_favorables?: string;
};

export type WaterCutData = {
  commune: string;
  details: WaterCutDetail[];
};

export type WaterDataMap = {
  [code_zone: string]: WaterCutData;
};

export type DateFilter = 'today' | 'tomorrow' | 'week';

export type CommuneColors = {
  primary: string;
  light: string;
  border: string;
};
