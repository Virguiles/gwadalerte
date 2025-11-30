J'ai analysé et refactorisé les composants dans les trois dossiers (`tours-deau`, `meteo`, `qualite-air`) pour améliorer la maintenabilité et réduire la duplication de code.

Voici les principales améliorations apportées :

### 1. Création de composants partagés (`frontend/app/components/shared/`)
-   **`TooltipContainer.tsx`** : J'ai extrait la logique des infobulles (positionnement, style glassmorphism, bouton de fermeture, animation) dans un composant générique. Cela évite de dupliquer tout ce code entre la météo et les tours d'eau.

### 2. Refactoring du module "Tours d'eau" (`frontend/app/tours-deau/components/`)
-   **Extraction des vues** : J'ai découpé `WaterSidebar.tsx` (qui était trop volumineux) en trois fichiers plus petits :
    -   `WaterSidebar.tsx` (Orchestrateur principal)
    -   `WaterGlobalView.tsx` (Vue d'ensemble de l'archipel)
    -   `WaterCommuneView.tsx` (Détails d'une commune)
-   **Nettoyage des SVG** : J'ai créé `WaterIcons.tsx` pour stocker les logos complexes et remplacé les nombreuses icônes SVG "inline" par des icônes standardisées de la librairie `lucide-react`.
-   **`WaterTooltip.tsx`** : Refactorisé pour utiliser le nouveau `TooltipContainer`.

### 3. Refactoring du module "Météo" (`frontend/app/meteo/components/`)
-   **Hook personnalisé** : J'ai créé `useArchipelMeteo.ts` dans les hooks pour extraire la logique de calcul des moyennes (température, vent, état de la mer) hors du composant d'affichage.
-   **Extraction des vues** : Comme pour les tours d'eau, j'ai séparé l'affichage en :
    -   `MeteoGlobalView.tsx`
    -   `MeteoCommuneView.tsx`
-   **`MeteoTooltip.tsx`** : Refactorisé pour utiliser `TooltipContainer` (avec support de la transparence pour les dégradés météo) et utilisation d'icônes `lucide-react`.

### 4. Module "Qualité de l'Air"
-   Ce module était déjà bien structuré (séparation `AirGlobalView`/`AirCommuneView` et utilisation de `InteractiveGuide`), donc je n'ai pas eu besoin de le modifier structurellement, il servait déjà de bon modèle.

Le code est maintenant plus modulaire, plus lisible et plus facile à maintenir. Si vous souhaitez modifier le style des infobulles à l'avenir, vous n'aurez qu'à toucher à `TooltipContainer`.
