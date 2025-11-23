import React, { useMemo } from 'react';

interface CommuneSelectorProps {
  selectedCommune: string;
  onSelectCommune: (code: string) => void;
  communes: { [code: string]: string }; // Objet { code: nom }
  title?: string;
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
  title = "Météo par commune"
}) => {
  const communeOptions = useMemo(() => {
    return Object.entries(communes).sort(([, nameA], [, nameB]) =>
      nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' })
    );
  }, [communes]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center sm:text-left">
        {title}
      </h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">1</span>
          <span>Choisir dans la liste</span>
        </div>
        <span className="hidden sm:inline text-gray-400 dark:text-gray-600">•</span>
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">2</span>
          <span>Ou toucher/survoler la carte</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="commune-select" className="sr-only">
          Sélectionner une commune
        </label>
        <select
          id="commune-select"
          value={selectedCommune}
          onChange={(event) => onSelectCommune(event.target.value)}
          className="flex-1 px-4 py-3 sm:py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white font-medium transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 text-base sm:text-base"
        >
          <option value="">-- Choisir une commune --</option>
          {communeOptions.map(([code, label]) => (
            <option key={code} value={code}>
              {capitalizeWords(label)}
            </option>
          ))}
        </select>
        {selectedCommune ? (
          <button
            type="button"
            onClick={() => onSelectCommune('')}
            className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Réinitialiser
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              const select = document.getElementById('commune-select') as HTMLSelectElement;
              if (select) {
                select.focus();
                select.click();
              }
            }}
            className="sm:hidden px-6 py-3 rounded-xl bg-blue-600 dark:bg-blue-700 text-white font-bold text-base hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md"
          >
            Voir ma commune
          </button>
        )}
      </div>
    </div>
  );
};
