// Service Worker vide pour éviter les erreurs 404
// Ce fichier est créé pour répondre aux requêtes du navigateur
// qui cherche un service worker enregistré précédemment

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
