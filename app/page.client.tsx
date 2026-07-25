'use client'; // Indispensable pour utiliser les hooks

import { useState, useEffect } from 'react';
import GuadeloupeMap, { AirData, HoverInfo } from './components/GuadeloupeMap';

// Fonctions utilitaires pour les informations sur la qualité de l'air (selon les standards ATMO de Gwad'Air)
function getQualityDescription(libQual: string): string {
  const descriptions: Record<string, string> = {
    'Bon': 'La qualité de l\'air est bonne. Les concentrations de polluants sont faibles et généralement sans danger pour la santé.',
    'Moyen': 'La qualité de l\'air est acceptable. Les personnes sensibles peuvent ressentir des effets légers.',
    'Dégradé': 'La qualité de l\'air est dégradée. Les personnes sensibles peuvent ressentir des effets sur leur santé.',
    'Mauvais': 'La qualité de l\'air est mauvaise. Toute la population peut ressentir des effets sur la santé.',
    'Très Mauvais': 'La qualité de l\'air est très mauvaise. Des effets graves sur la santé sont possibles pour toute la population.',
    'Extrêmement Mauvais': 'La qualité de l\'air est extrêmement mauvaise. Des effets très graves sur la santé sont possibles pour toute la population.',
    // Support des anciens libellés pour compatibilité
    'Très bon': 'La qualité de l\'air est excellente. Les concentrations de polluants sont très faibles et ne présentent aucun risque pour la santé.',
    'Médiocre': 'La qualité de l\'air est préoccupante. Les personnes sensibles peuvent ressentir des effets sur leur santé.',
    'Très mauvais': 'La qualité de l\'air est très mauvaise. Des effets graves sur la santé sont possibles pour toute la population.',
  };

  return descriptions[libQual] || '';
}

function getQualityPercentage(libQual: string): number {
  const percentages: Record<string, number> = {
    'Bon': 100,
    'Moyen': 83,
    'Dégradé': 66,
    'Mauvais': 50,
    'Très Mauvais': 33,
    'Extrêmement Mauvais': 16,
    // Support des anciens libellés pour compatibilité
    'Très bon': 100,
    'Médiocre': 50,
    'Très mauvais': 16,
  };

  return percentages[libQual] || 0;
}

function getRecommendations(libQual: string): string {
  const recommendations: Record<string, string> = {
    'Bon': 'Activités normales en plein air autorisées pour tous.',
    'Moyen': 'Les personnes sensibles devraient limiter les efforts prolongés en extérieur.',
    'Dégradé': 'Les personnes sensibles devraient éviter les activités en extérieur. Les autres peuvent continuer normalement.',
    'Mauvais': 'Tout le monde devrait limiter les activités en extérieur. Les personnes sensibles doivent éviter les sorties.',
    'Très Mauvais': 'Évitez toutes les activités en extérieur. Restez à l\'intérieur avec les fenêtres fermées.',
    'Extrêmement Mauvais': 'Évitez absolument toutes les activités en extérieur. Restez à l\'intérieur avec les fenêtres fermées.',
    // Support des anciens libellés pour compatibilité
    'Très bon': 'Conditions idéales pour toutes les activités en plein air.',
    'Médiocre': 'Les personnes sensibles devraient éviter les activités en extérieur. Les autres peuvent continuer normalement.',
    'Très mauvais': 'Évitez toutes les activités en extérieur. Restez à l\'intérieur avec les fenêtres fermées.',
  };

  return recommendations[libQual] || '';
}

function getAlertLevel(libQual: string): { label: string } {
  const alertLevels: Record<string, { label: string }> = {
    'Bon': { label: 'Aucun risque' },
    'Moyen': { label: 'Faible risque' },
    'Dégradé': { label: 'Attention' },
    'Mauvais': { label: 'Modéré' },
    'Très Mauvais': { label: 'Élevé' },
    'Extrêmement Mauvais': { label: 'Critique' },
    // Support des anciens libellés pour compatibilité
    'Très bon': { label: 'Aucun risque' },
    'Médiocre': { label: 'Modéré' },
    'Très mauvais': { label: 'Critique' },
  };

  return alertLevels[libQual] || { label: 'Inconnu' };
}

// Fonction pour convertir un code de qualité en libellé et couleur (selon l'API Gwad'Air)
// Utilise les couleurs exactes renvoyées par l'API Gwad'Air
function getQualityFromCode(code: number | undefined): { label: string; color: string } {
  const qualityMap: Record<number, { label: string; color: string }> = {
    1: { label: 'Bon', color: '#50F0E6' },
    2: { label: 'Moyen', color: '#50CCAA' },
    3: { label: 'Dégradé', color: '#F0E641' }, // Couleur exacte de l'API
    4: { label: 'Mauvais', color: '#FF5050' }, // Couleur exacte de l'API
    5: { label: 'Très Mauvais', color: '#960032' }, // Couleur exacte de l'API
    6: { label: 'Extrêmement Mauvais', color: '#803399' }, // Couleur exacte du site gwadair.fr
    0: { label: 'Absent', color: '#DDDDDD' }, // Couleur exacte de l'API pour "Absent"
  };

  if (code === undefined || code === null) {
    return { label: 'N/A', color: '#b9b9b9' };
  }

  return qualityMap[code] || { label: 'Inconnu', color: '#b9b9b9' };
}

function HomeClient({ initialAirData, initialLastUpdate }: { initialAirData: AirData; initialLastUpdate: number | null }) {
  // Fonction pour charger depuis le cache localStorage (utilisée pour l'initialisation)
  const loadFromLocalCache = (): { data: AirData; timestamp: number } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const CACHE_KEY = 'gwada_air_quality_cache';
      const CACHE_TIMESTAMP_KEY = 'gwada_air_quality_cache_timestamp';
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedData && cachedData.trim() !== '' && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        // Vérifier si le cache local est plus récent que les données serveur
        if (!initialLastUpdate || timestamp > initialLastUpdate) {
          return {
            data: JSON.parse(cachedData),
            timestamp,
          };
        }
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du cache local:', error);
    }
    return null;
  };

  // Initialisation avec les données serveur ou le cache local si plus récent
  const [airData, setAirData] = useState<AirData>(() => {
    const localCache = loadFromLocalCache();
    return localCache ? localCache.data : initialAirData;
  });
  const [tooltip, setTooltip] = useState<HoverInfo | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(() => {
    const localCache = loadFromLocalCache();
    if (localCache) {
      return new Date(localCache.timestamp);
    }
    return initialLastUpdate ? new Date(initialLastUpdate) : null;
  });

  // Fonction pour vérifier si deux dates sont le même jour
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Fonction pour formater la date et l'heure
  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Charger les données depuis le cache localStorage si nécessaire
  useEffect(() => {
    // Ne rien faire côté serveur
    if (typeof window === 'undefined') return;

    const CACHE_KEY = 'gwada_air_quality_cache';
    const CACHE_TIMESTAMP_KEY = 'gwada_air_quality_cache_timestamp';

    // Fonction pour sauvegarder dans le cache
    const saveToCache = (data: AirData) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        const timestamp = Date.now();
        localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
        setLastUpdate(new Date(timestamp));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du cache:', error);
      }
    };


    // Vérifier si un appel API est nécessaire
    const shouldFetch = (): boolean => {
      try {
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (!cachedTimestamp) {
          return true; // Pas de cache, on doit faire un appel
        }

        const timestamp = parseInt(cachedTimestamp, 10);
        const lastUpdateDate = new Date(timestamp);
        const now = new Date();

        // Calculer la différence en millisecondes
        const diffMs = now.getTime() - lastUpdateDate.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        // Faire un appel si :
        // - La dernière mise à jour n'est pas d'aujourd'hui
        // - OU si le cache a plus de 3 minutes (pour correspondre au TTL du backend)
        if (!isSameDay(lastUpdateDate, now) || diffMinutes > 3) {
          console.log(`[Cache] Cache expiré (âge: ${Math.round(diffMinutes)} minutes), rafraîchissement nécessaire`);
          return true;
        }

        console.log(`[Cache] Utilisation du cache local (âge: ${Math.round(diffMinutes)} minutes)`);
        return false;
      } catch (error) {
        console.error('Erreur lors de la vérification du cache:', error);
        return true; // En cas d'erreur, on fait un appel
      }
    };

    // Faire un appel API seulement si nécessaire (toutes les 3 minutes ou si pas d'aujourd'hui)
    if (shouldFetch()) {
      // Utiliser les API Routes Next.js locales
      fetch('/api/air-quality')
        .then((res) => res.json())
        .then((data) => {
          setAirData(data);
          saveToCache(data); // Sauvegarder dans le cache
        })
        .catch((error) => {
          console.error('Erreur lors de la récupération des données:', error);
          // Si l'appel API échoue, on garde les données actuelles
        });
    }
  }, [initialLastUpdate]); // Dépend de initialLastUpdate

  // Définition des niveaux de qualité d'air pour la légende (selon les standards ATMO de Gwad'Air)
  // Ces couleurs par défaut correspondent aux couleurs exactes renvoyées par l'API Gwad'Air
  // Elles ne sont utilisées que si les données de l'API ne sont pas encore chargées
  const qualityLevels = [
    { label: 'Bon', color: '#50F0E6' },
    { label: 'Moyen', color: '#50CCAA' },
    { label: 'Dégradé', color: '#F0E641' }, // Couleur exacte de l'API
    { label: 'Mauvais', color: '#FF5050' }, // Couleur exacte de l'API
    { label: 'Très Mauvais', color: '#960032' }, // Couleur exacte de l'API
    { label: 'Extrêmement Mauvais', color: '#803399' }, // Couleur exacte du site gwadair.fr
  ];

  // Fonction pour obtenir la couleur d'un niveau depuis les données réelles
  const getLevelColor = (label: string): string => {
    const found = Object.values(airData).find((data) => data.lib_qual === label);
    return found?.coul_qual || qualityLevels.find((level) => level.label === label)?.color || '#b9b9b9';
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative bg-gray-50">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-800">Qualité de l&apos;Air en Guadeloupe</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          {/* Carte */}
          <div className="flex-1 w-full bg-white shadow-xl rounded-xl overflow-hidden border-2 border-gray-200 flex flex-col" style={{ height: '700px' }}>
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex-shrink-0">
              <p className="text-sm text-gray-700 font-medium">
                🌬️ <span className="font-semibold">Les couleurs indiquent la qualité de l&apos;air par zone</span> - Survolez une commune pour voir les détails
              </p>
              <p className="text-xs text-gray-500 mt-1">Source: Gwad&apos;Air</p>
            </div>
            <div className="w-full flex justify-center items-center p-6 bg-white flex-1 min-h-0">
              <GuadeloupeMap
                data={airData}
                onCommuneHover={setTooltip}
                onCommuneLeave={() => setTooltip(null)}
              />
            </div>
          </div>

          {/* Légende */}
          <div className="w-full lg:w-80 bg-white rounded-lg shadow-lg p-6 lg:sticky lg:top-6">
            <h2 className="text-xl font-bold mb-1 text-gray-800">Niveaux d&apos;alerte</h2>
            <p className="text-xs text-gray-500 mb-4">Qualité de l&apos;air en Guadeloupe</p>
            <div className="space-y-2.5">
              {qualityLevels.map((level) => {
                const actualColor = getLevelColor(level.label);
                const alertLevel = getAlertLevel(level.label);
                return (
                  <div
                    key={level.label}
                    className="border rounded-lg p-3 hover:shadow-md transition-all"
                    style={{ borderColor: actualColor + '40' }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Indicateur de couleur */}
                      <div
                        className="w-10 h-10 rounded-lg border-2 flex-shrink-0"
                        style={{
                          backgroundColor: actualColor,
                          borderColor: actualColor + '80'
                        }}
                      >
                      </div>

                      {/* Label et informations */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="font-bold text-sm"
                            style={{ color: actualColor }}
                          >
                            {level.label}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                            {alertLevel.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2">
                          {getQualityDescription(level.label)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {lastUpdate && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">
                    <strong className="text-gray-700">Dernière mise à jour :</strong>
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {formatDateTime(lastUpdate)}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-700">Note :</strong> Les couleurs affichées correspondent aux données actuelles de qualité d&apos;air mesurées en Guadeloupe. Les données sont mises à jour une fois par jour.
              </p>
            </div>
          </div>
        </div>

        {/* 2. L'infobulle (Tooltip) */}
        {tooltip && (
          <div
            className="absolute bg-white border-2 rounded-xl shadow-2xl pointer-events-none transition-all z-50 min-w-[280px] max-w-[320px]"
            style={{
              left: tooltip.x + 20, // Décalage pour le curseur
              top: tooltip.y + 20,
              borderColor: tooltip.data.coul_qual,
              boxShadow: `0 10px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px ${tooltip.data.coul_qual}20`,
            }}
          >
            {/* En-tête avec couleur de fond */}
            <div
              className="px-4 py-3 rounded-t-xl text-white font-bold text-lg"
              style={{ backgroundColor: tooltip.data.coul_qual }}
            >
              {tooltip.data.lib_zone}
            </div>

            {/* Corps du tooltip */}
            <div className="px-4 py-4 space-y-3">
              {/* Qualité de l'air - principale */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Qualité de l&apos;air
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: tooltip.data.coul_qual }}
                  >
                    {tooltip.data.lib_qual}
                  </span>
                </div>

                {/* Description de la qualité */}
                {getQualityDescription(tooltip.data.lib_qual || '') && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {getQualityDescription(tooltip.data.lib_qual || '')}
                  </p>
                )}
              </div>

              {/* Séparateur */}
              <div className="border-t border-gray-200"></div>

              {/* Informations supplémentaires */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Code zone</span>
                  <span className="text-xs font-mono font-semibold text-gray-700">
                    {tooltip.data.code_zone || 'N/A'}
                  </span>
                </div>

                {/* Indicateur visuel */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: getQualityPercentage(tooltip.data.lib_qual || '') + '%',
                        backgroundColor: tooltip.data.coul_qual,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {getQualityPercentage(tooltip.data.lib_qual || '')}%
                  </span>
                </div>
              </div>

              {/* Informations sur les polluants */}
              {(tooltip.data.code_no2 !== undefined ||
                tooltip.data.code_so2 !== undefined ||
                tooltip.data.code_o3 !== undefined ||
                tooltip.data.code_pm10 !== undefined ||
                tooltip.data.code_pm25 !== undefined) && (
                  <>
                    <div className="border-t border-gray-200"></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Détails par polluant
                      </p>
                      <div className="space-y-1.5">
                        {tooltip.data.code_no2 !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">NO₂</span>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: getQualityFromCode(tooltip.data.code_no2 as number | undefined).color }}
                            >
                              {getQualityFromCode(tooltip.data.code_no2 as number | undefined).label}
                            </span>
                          </div>
                        )}
                        {tooltip.data.code_so2 !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">SO₂</span>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: getQualityFromCode(tooltip.data.code_so2 as number | undefined).color }}
                            >
                              {getQualityFromCode(tooltip.data.code_so2 as number | undefined).label}
                            </span>
                          </div>
                        )}
                        {tooltip.data.code_o3 !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">O₃</span>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: getQualityFromCode(tooltip.data.code_o3 as number | undefined).color }}
                            >
                              {getQualityFromCode(tooltip.data.code_o3 as number | undefined).label}
                            </span>
                          </div>
                        )}
                        {tooltip.data.code_pm10 !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">PM10</span>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: getQualityFromCode(tooltip.data.code_pm10 as number | undefined).color }}
                            >
                              {getQualityFromCode(tooltip.data.code_pm10 as number | undefined).label}
                            </span>
                          </div>
                        )}
                        {tooltip.data.code_pm25 !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">PM2.5</span>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: getQualityFromCode(tooltip.data.code_pm25 as number | undefined).color }}
                            >
                              {getQualityFromCode(tooltip.data.code_pm25 as number | undefined).label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

              {/* Recommandations */}
              {getRecommendations(tooltip.data.lib_qual || '') && (
                <>
                  <div className="border-t border-gray-200"></div>
                  <div className="bg-blue-50 rounded-lg p-2.5">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      💡 Recommandations
                    </p>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      {getRecommendations(tooltip.data.lib_qual || '')}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default HomeClient;
