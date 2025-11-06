# GwadaSVG

Application web interactive pour visualiser les données de la Guadeloupe avec des cartes SVG interactives.

## 🏗️ Structure du projet

```
GwadaSVG/
├── backend/          # API FastAPI
│   ├── main.py      # Point d'entrée de l'API
│   └── requirements.txt
└── frontend/        # Application Next.js
    ├── app/         # Pages et composants
    └── public/      # Assets statiques (cartes SVG)
```

## 🚀 Installation

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

L'API sera disponible sur `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 📦 Technologies utilisées

- **Backend**: FastAPI, Python
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Cartes**: SVG interactives de la Guadeloupe

## 📝 Fonctionnalités

- Visualisation interactive de cartes SVG de la Guadeloupe
- Affichage des tours d'eau
- Interface moderne et responsive

## 🔧 Développement

Le projet est en cours de développement. Les fonctionnalités sont ajoutées progressivement.

