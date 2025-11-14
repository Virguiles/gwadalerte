'use client'; // Indispensable pour utiliser les hooks

import { useState, useEffect } from 'react';
import GuadeloupeMap, { AirData, HoverInfo } from '../components/GuadeloupeMap';

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

export default function QualiteAir() {
  // Fonction pour charger depuis le cache (utilisée pour l'initialisation lazy)
  const loadFromCache = (): { data: AirData; timestamp: number } | null => {
    if (typeof window === 'undefined') return null; // SSR
    try {
      const CACHE_KEY = 'gwada_air_quality_cache';
      const CACHE_TIMESTAMP_KEY = 'gwada_air_quality_cache_timestamp';
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        return {
          data: JSON.parse(cachedData),
          timestamp,
        };
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du cache:', error);
    }
    return null;
  };

  // État pour savoir si le composant est monté côté client (pour éviter l'hydratation mismatch)
  // Initialisé à false pour que le rendu serveur et client soit identique
  const [mounted, setMounted] = useState(false);

  // Initialisation avec données vides pour que le rendu serveur et client soit identique
  // Les données seront chargées depuis le cache dans useEffect après l'hydratation
  const [airData, setAirData] = useState<AirData>({});
  const [tooltip, setTooltip] = useState<HoverInfo | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedCommune, setSelectedCommune] = useState<string>(''); // Code zone de la commune sélectionnée

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

  // Marquer le composant comme monté et charger les données du cache après l'hydratation
  useEffect(() => {
    setMounted(true);

    // Charger les données du cache après l'hydratation
    const cached = loadFromCache();
    if (cached) {
      setAirData(cached.data);
      setLastUpdate(new Date(cached.timestamp));
    }
  }, []);

  // Vérifier et faire un appel API seulement si nécessaire (une fois par jour)
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
      fetch('http://127.0.0.1:8000/api/air-quality')
        .then((res) => res.json())
        .then((data) => {
          setAirData(data);
          saveToCache(data); // Sauvegarder dans le cache
        })
        .catch((error) => {
          console.error('Erreur lors de la récupération des données:', error);
          // Si l'appel API échoue, on garde les données du cache si elles existent
        });
    }
  }, []); // Se lance une seule fois après le montage

  // Définition des niveaux de qualité d'air pour la légende (selon les standards ATMO de Gwad'Air)
  // Ces couleurs par défaut correspondent aux couleurs exactes renvoyées par l'API Gwad'Air
  // Elles ne sont utilisées que si les données de l'API ne sont pas encore chargées
  const defaultQualityLevels = [
    { label: 'Bon', color: '#50F0E6' },
    { label: 'Moyen', color: '#50CCAA' },
    { label: 'Dégradé', color: '#F0E641' }, // Couleur exacte de l'API (différente de #FFC800)
    { label: 'Mauvais', color: '#FF5050' }, // Couleur exacte de l'API (différente de #FF0000)
    { label: 'Très Mauvais', color: '#960032' }, // Couleur exacte de l'API (différente de #8F3F97)
    { label: 'Extrêmement Mauvais', color: '#803399' }, // Couleur exacte du site gwadair.fr
  ];

  // Extraire les couleurs réelles depuis les données de l'API
  const getQualityLevelsFromAPI = () => {
    // Créer un Map pour stocker les couleurs par label (insensible à la casse pour éviter les doublons)
    const colorMap = new Map<string, string>();

    // Parcourir toutes les données de l'API pour extraire les couleurs
    Object.values(airData).forEach((data) => {
      if (data.lib_qual && data.coul_qual) {
        // Normaliser le label (insensible à la casse) pour la correspondance
        const normalizedLabel = data.lib_qual.trim();
        // Utiliser la couleur de l'API si elle n'est pas déjà définie
        if (!colorMap.has(normalizedLabel)) {
          colorMap.set(normalizedLabel, data.coul_qual);
        }
      }
    });

    // Construire la liste des niveaux avec les couleurs de l'API
    return defaultQualityLevels.map((level) => {
      // Chercher la couleur dans le Map en comparant de manière insensible à la casse
      let apiColor: string | undefined;
      for (const [apiLabel, apiColorValue] of colorMap.entries()) {
        if (apiLabel.toLowerCase() === level.label.toLowerCase()) {
          apiColor = apiColorValue;
          break;
        }
      }

      return {
        label: level.label,
        color: apiColor || level.color, // Utiliser la couleur de l'API si disponible, sinon la couleur par défaut
      };
    });
  };

  // Obtenir les niveaux de qualité avec les couleurs de l'API
  const qualityLevels = getQualityLevelsFromAPI();

  // Fonction pour obtenir la couleur d'un niveau depuis les données réelles de l'API
  const getLevelColor = (label: string): string => {
    // D'abord chercher dans les données de l'API (comparaison insensible à la casse)
    const found = Object.values(airData).find((data) =>
      data.lib_qual && data.lib_qual.toLowerCase() === label.toLowerCase()
    );
    if (found?.coul_qual) {
      return found.coul_qual;
    }
    // Sinon utiliser la couleur par défaut
    return defaultQualityLevels.find((level) => level.label.toLowerCase() === label.toLowerCase())?.color || '#b9b9b9';
  };

  // Fonction pour calculer la position optimale du tooltip
  const calculateTooltipPosition = (mouseX: number, mouseY: number) => {
    if (typeof window === 'undefined') return { x: mouseX, y: mouseY };

    // Calculer la largeur du tooltip en fonction de la taille de l'écran (responsive)
    let tooltipWidth = 320; // Par défaut (md et plus)
    if (window.innerWidth < 640) {
      tooltipWidth = 280; // Petit écran
    } else if (window.innerWidth < 768) {
      tooltipWidth = 300; // Écran moyen
    }

    const tooltipHeight = 450; // Estimation de la hauteur approximative (avec scroll si nécessaire)
    const margin = 20; // Marge de sécurité par rapport aux bords
    const offset = 15; // Décalage par rapport au curseur

    let x = mouseX + offset;
    let y = mouseY + offset;

    // Vérifier si le tooltip dépasse à droite
    if (x + tooltipWidth + margin > window.innerWidth) {
      x = mouseX - tooltipWidth - offset; // Placer à gauche du curseur
    }

    // Vérifier si le tooltip dépasse toujours (cas extrême gauche)
    if (x < margin) {
      x = margin;
    }

    // Vérifier si le tooltip dépasse en bas
    if (y + tooltipHeight + margin > window.innerHeight) {
      y = mouseY - tooltipHeight - offset; // Placer au-dessus du curseur
    }

    // Vérifier si le tooltip dépasse toujours (cas extrême haut)
    if (y < margin) {
      y = margin;
    }

    // S'assurer que le tooltip ne dépasse pas à droite même après ajustement
    if (x + tooltipWidth > window.innerWidth - margin) {
      x = window.innerWidth - tooltipWidth - margin;
    }

    return { x, y };
  };

  // Effet pour afficher automatiquement le tooltip quand une commune est sélectionnée
  useEffect(() => {
    if (selectedCommune && airData[selectedCommune]) {
      const communeData = airData[selectedCommune];
      // Positionner le tooltip au centre de l'écran (ou à un endroit fixe)
      const centerX = window.innerWidth / 2 - 160;
      const centerY = 150;
      const position = calculateTooltipPosition(centerX, centerY);

      setTooltip({
        x: position.x,
        y: position.y,
        data: {
          ...communeData,
          code_zone: selectedCommune,
        },
      });
    } else if (!selectedCommune) {
      // Si on désélectionne, on enlève le tooltip
      setTooltip(null);
    }
  }, [selectedCommune, airData]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative bg-gray-50">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-800">Qualité de l&apos;Air en Guadeloupe</h1>
        </div>

        {/* Sélecteur de commune */}
        <div className="w-full max-w-md mx-auto mb-6">
          <label htmlFor="commune-select" className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner une commune
          </label>
          <select
            id="commune-select"
            value={selectedCommune}
            onChange={(e) => setSelectedCommune(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-400 text-gray-900 font-medium"
          >
            <option value="">-- Choisir une commune --</option>
            {Object.entries(airData)
              .sort(([, a], [, b]) => a.lib_zone.localeCompare(b.lib_zone))
              .map(([code, data]) => (
                <option key={code} value={code}>
                  {data.lib_zone}
                </option>
              ))}
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          {/* Carte */}
          <div className="flex-1 w-full bg-white shadow-xl rounded-xl overflow-hidden border-2 border-gray-200 flex flex-col" style={{ height: '700px' }}>
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex-shrink-0">
              <p className="text-sm text-gray-700 font-medium">
                🌬️ <span className="font-semibold">Les couleurs indiquent la qualité de l&apos;air par zone</span> - Survolez une commune ou sélectionnez-la dans le menu déroulant
              </p>
              <p className="text-xs text-gray-500 mt-1">Source: Gwad&apos;Air</p>
            </div>
            <div className="w-full flex justify-center items-center p-6 bg-white flex-1 min-h-0">
              <GuadeloupeMap
                data={airData}
                selectedCommune={selectedCommune}
                onCommuneHover={(hoverInfo) => {
                  // Calculer la position optimale du tooltip lors du hover
                  // S'assurer que le tooltip s'affiche immédiatement
                  const position = calculateTooltipPosition(hoverInfo.x, hoverInfo.y);
                  setTooltip({
                    ...hoverInfo,
                    x: position.x,
                    y: position.y,
                  });
                }}
                onCommuneLeave={() => {
                  // Le délai de masquage est géré dans GuadeloupeMap
                  // Ici, on gère seulement la logique de réaffichage si une commune est sélectionnée
                  if (selectedCommune && airData[selectedCommune]) {
                    const communeData = airData[selectedCommune];
                    const centerX = window.innerWidth / 2 - 160;
                    const centerY = 150;
                    const position = calculateTooltipPosition(centerX, centerY);

                    setTooltip({
                      x: position.x,
                      y: position.y,
                      data: {
                        ...communeData,
                        code_zone: selectedCommune,
                      },
                    });
                  } else {
                    // Masquer le tooltip seulement si aucune commune n'est sélectionnée
                    // Le délai est déjà géré dans GuadeloupeMap
                    setTooltip(null);
                  }
                }}
              />
            </div>
          </div>

          {/* Légende simplifiée */}
          <div className="w-full lg:w-64 bg-white rounded-lg shadow-lg p-4 lg:sticky lg:top-6">
            <h2 className="text-lg font-bold mb-3 text-gray-800">Légende</h2>
            <div className="space-y-2">
              {qualityLevels.map((level) => {
                // level.color contient déjà la couleur de l'API (ou la couleur par défaut si pas encore chargée)
                return (
                  <div
                    key={level.label}
                    className="flex items-center gap-3"
                  >
                    {/* Indicateur de couleur */}
                    <div
                      className="w-8 h-8 rounded border-2 flex-shrink-0"
                      style={{
                        backgroundColor: level.color,
                        borderColor: level.color + '80'
                      }}
                    >
                    </div>
                    {/* Label */}
                    <span
                      className="text-sm font-medium text-gray-700"
                    >
                      {level.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {mounted && lastUpdate && (
                <div className="mb-2">
                  <p className="text-xs text-gray-600 mb-1">
                    <strong className="text-gray-700">Dernière mise à jour :</strong>
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {formatDateTime(lastUpdate)}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-700">Source :</strong> Gwad&apos;Air
              </p>
            </div>
          </div>
        </div>

        {/* Section détaillée des niveaux d'alerte sous la carte */}
        <div className="w-full mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Niveaux d&apos;alerte - Détails</h2>
          <p className="text-sm text-gray-600 mb-6">Informations détaillées sur chaque niveau de qualité de l&apos;air</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {qualityLevels.map((level) => {
              const actualColor = getLevelColor(level.label);
              const alertLevel = getAlertLevel(level.label);
              return (
                <div
                  key={level.label}
                  className="border rounded-lg p-4 hover:shadow-md transition-all"
                  style={{ borderColor: actualColor + '40' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {/* Indicateur de couleur */}
                    <div
                      className="w-12 h-12 rounded-lg border-2 flex-shrink-0"
                      style={{
                        backgroundColor: actualColor,
                        borderColor: actualColor + '80'
                      }}
                    >
                    </div>
                    {/* Label et niveau d'alerte */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-bold text-base"
                          style={{ color: actualColor }}
                        >
                          {level.label}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                        {alertLevel.label}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {getQualityDescription(level.label)}
                  </p>

                  {/* Recommandations */}
                  {getRecommendations(level.label) && (
                    <div className="bg-blue-50 rounded-lg p-2.5 mt-3">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        💡 Recommandations
                      </p>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        {getRecommendations(level.label)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. L'infobulle (Tooltip) */}
        {tooltip && (
          <div
            className="fixed bg-white border-2 rounded-xl shadow-2xl pointer-events-auto transition-all z-50 w-[280px] sm:w-[300px] md:w-[320px]"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              borderColor: tooltip.data.coul_qual,
              boxShadow: `0 10px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px ${tooltip.data.coul_qual}20`,
              maxHeight: 'calc(100vh - 40px)', // Limiter la hauteur pour éviter de dépasser l'écran
              overflowY: 'auto', // Ajouter un scroll si nécessaire
            }}
          >
            {/* En-tête avec couleur de fond */}
            <div
              className="px-4 py-3 rounded-t-xl text-white font-bold text-lg flex items-center justify-between"
              style={{ backgroundColor: tooltip.data.coul_qual }}
            >
              <span>{tooltip.data.lib_zone}</span>
              <button
                onClick={() => {
                  setSelectedCommune('');
                  setTooltip(null);
                }}
                className="ml-2 text-white hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded p-1"
                aria-label="Fermer"
                title="Fermer et revenir à la carte"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Corps du tooltip */}
            <div className="px-4 py-4 space-y-3">
              {/* Qualité de l'air - principale */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Qualité de l&apos;air
                  </span>

                </div>

                {/* Description de la qualité */}
                {getQualityDescription(tooltip.data.lib_qual) && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {getQualityDescription(tooltip.data.lib_qual)}
                  </p>
                )}
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
                            style={{ backgroundColor: getQualityFromCode(tooltip.data.code_no2).color }}
                          >
                            {getQualityFromCode(tooltip.data.code_no2).label}
                          </span>
                        </div>
                      )}
                      {tooltip.data.code_so2 !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">SO₂</span>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: getQualityFromCode(tooltip.data.code_so2).color }}
                          >
                            {getQualityFromCode(tooltip.data.code_so2).label}
                          </span>
                        </div>
                      )}
                      {tooltip.data.code_o3 !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">O₃</span>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: getQualityFromCode(tooltip.data.code_o3).color }}
                          >
                            {getQualityFromCode(tooltip.data.code_o3).label}
                          </span>
                        </div>
                      )}
                      {tooltip.data.code_pm10 !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">PM10</span>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: getQualityFromCode(tooltip.data.code_pm10).color }}
                          >
                            {getQualityFromCode(tooltip.data.code_pm10).label}
                          </span>
                        </div>
                      )}
                      {tooltip.data.code_pm25 !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">PM2.5</span>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: getQualityFromCode(tooltip.data.code_pm25).color }}
                          >
                            {getQualityFromCode(tooltip.data.code_pm25).label}
                          </span>
                        </div>
                      )}
                    </div>
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
