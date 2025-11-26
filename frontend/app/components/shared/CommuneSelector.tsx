import React, { useMemo } from 'react';
import { Search, X, MapPin } from 'lucide-react';

interface CommuneSelectorProps {
  selectedCommune: string;
  onSelectCommune: (code: string) => void;
  communes: { [code: string]: string }; // Objet { code: nom }
}

// Fonction pour mettre en capitalize chaque mot (gère les espaces et les tirets)
const capitalizeWords = (str: string): string => {
  // Mots à garder en minuscule (prépositions, articles)
  const lowercaseWords = new Set(['de', 'du', 'des', 'le', 'la', 'les', 'à', 'au', 'aux', 'en', 'et']);

  // Préserver les séparateurs originaux (espaces et tirets)
  const parts: string[] = [];
  const separators: string[] = [];
  let currentPart = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === ' ' || char === '-') {
      if (currentPart) {
        parts.push(currentPart.toLowerCase());
        currentPart = '';
      }
      separators.push(char);
    } else {
      currentPart += char;
    }
  }
  if (currentPart) {
    parts.push(currentPart.toLowerCase());
  }

  // Capitaliser chaque partie (sauf les mots en minuscule)
  const capitalizedParts = parts.map((part, index) => {
    // Garder en minuscule si c'est un mot spécial ET que ce n'est pas le premier mot
    if (index > 0 && lowercaseWords.has(part)) {
      return part;
    }
    return part.charAt(0).toUpperCase() + part.slice(1);
  });

  // Reconstruire avec les séparateurs originaux
  let result = '';
  for (let i = 0; i < capitalizedParts.length; i++) {
    result += capitalizedParts[i];
    if (i < separators.length) {
      result += separators[i];
    }
  }

  return result;
};

export const CommuneSelector: React.FC<CommuneSelectorProps> = ({
  selectedCommune,
  onSelectCommune,
  communes,
}) => {
  const communeOptions = useMemo(() => {
    return Object.entries(communes).sort(([, nameA], [, nameB]) =>
      nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' })
    );
  }, [communes]);

  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      {/* Instructions discrètes */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <Search className="w-3.5 h-3.5" />
          <span>Choisir dans la liste</span>
        </div>
        <span className="text-gray-300 dark:text-gray-600">•</span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <MapPin className="w-3.5 h-3.5" />
          <span>Toucher/survoler la carte</span>
        </div>
      </div>

      {/* Sélecteur principal */}
      <div className="relative flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <select
            id="commune-select"
            value={selectedCommune}
            onChange={(event) => onSelectCommune(event.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white font-medium transition-all duration-200 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md appearance-none text-base"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              paddingRight: '2.75rem'
            }}
          >
            <option value="">-- Choisir une commune --</option>
            {communeOptions.map(([code, label]) => (
              <option key={code} value={code}>
                {capitalizeWords(label)}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton Réinitialiser - toujours présent sur desktop pour garder la même taille */}
        <button
          type="button"
          onClick={() => onSelectCommune('')}
          className={`hidden sm:flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 font-semibold transition-all duration-200 shadow-sm hover:shadow-md min-w-[140px] ${
            selectedCommune
              ? 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Réinitialiser la sélection"
          disabled={!selectedCommune}
        >
          <X className="w-4 h-4" />
          <span>Réinitialiser</span>
        </button>

        {/* Bouton mobile "Voir ma commune" - toujours présent sur mobile pour garder la même taille */}
        <button
          type="button"
          onClick={() => {
            const select = document.getElementById('commune-select') as HTMLSelectElement;
            if (select) {
              select.focus();
              select.click();
            }
          }}
          className={`sm:hidden flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 dark:bg-blue-700 text-white font-semibold text-base hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 ${
            selectedCommune ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 pointer-events-auto'
          }`}
        >
          <Search className="w-4 h-4" />
          Voir ma commune
        </button>

        {/* Bouton Réinitialiser mobile - toujours présent pour garder la même taille */}
        <button
          type="button"
          onClick={() => onSelectCommune('')}
          className={`sm:hidden flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md ${
            selectedCommune ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none invisible'
          }`}
          aria-label="Réinitialiser la sélection"
          disabled={!selectedCommune}
        >
          <X className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>
    </div>
  );
};
