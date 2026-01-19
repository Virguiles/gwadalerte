# 🔐 Sécurité - Token OpenWeatherMap exposé

## ⚠️ Situation

GitGuardian a détecté un token OpenWeatherMap exposé dans votre dépôt GitHub.

## ✅ Actions immédiates à prendre

### 1. Révoquer le token exposé (URGENT)

1. Connectez-vous à votre compte [OpenWeatherMap](https://openweathermap.org/api)
2. Allez dans votre profil → **API keys**
3. **Révoquez immédiatement** le token qui a été exposé
4. Créez un nouveau token si nécessaire

**Important** : Même si votre projet n'utilise plus OpenWeatherMap (il utilise maintenant Open-Meteo), vous devez révoquer le token pour éviter qu'il soit utilisé par des tiers.

### 2. Vérifier l'historique Git

Le token peut encore être présent dans l'historique Git même s'il n'est plus dans le code actuel.

Pour vérifier :
```bash
# Chercher dans tout l'historique Git
git log -p --all | grep -i "openweather" | grep -E "[a-zA-Z0-9]{20,}"
```

### 3. Nettoyer l'historique Git (si nécessaire)

⚠️ **ATTENTION** : Cette opération réécrit l'historique Git. Ne le faites que si :
- Le dépôt est privé OU
- Vous êtes sûr que personne n'a cloné le dépôt OU
- Vous pouvez coordonner avec tous les contributeurs

Si vous devez nettoyer l'historique :

```bash
# Option 1 : Utiliser git-filter-repo (recommandé)
# Installer : pip install git-filter-repo
git filter-repo --invert-paths --path "fichier_avec_token" --use-base-name

# Option 2 : Utiliser BFG Repo-Cleaner
# Télécharger : https://rtyley.github.io/bfg-repo-cleaner/
bfg --replace-text passwords.txt

# Après nettoyage, forcer le push (DANGEREUX)
git push origin --force --all
```

**Note** : Si le dépôt est public et a été cloné, le token reste accessible dans les clones existants. Dans ce cas, la révocation du token est la seule protection efficace.

## ✅ Corrections effectuées

1. ✅ Suppression des références obsolètes à `OPENWEATHER_API_KEY` dans `MIGRATION.md`
2. ✅ Vérification que le code actuel n'utilise plus OpenWeatherMap (utilise Open-Meteo à la place)
3. ✅ Confirmation que `.gitignore` exclut bien les fichiers `.env*`

## 📋 État actuel du projet

- ✅ Le projet utilise **Open-Meteo** (gratuit, sans clé API)
- ✅ Aucune référence à OpenWeatherMap dans le code actuel
- ✅ Les variables d'environnement sont correctement gérées via `.env.local` (non commité)

## 🔍 Prévention future

Pour éviter ce type d'incident :

1. **Ne jamais commiter de tokens/clés API** dans Git
2. **Utiliser des variables d'environnement** pour toutes les clés sensibles
3. **Vérifier `.gitignore`** avant chaque commit
4. **Utiliser des outils de scan** comme GitGuardian (déjà configuré)
5. **Utiliser des placeholders** dans la documentation (`votre_cle_api` au lieu de vraies clés)

## 📚 Ressources

- [GitGuardian Documentation](https://docs.gitguardian.com/)
- [OpenWeatherMap API Keys Management](https://home.openweathermap.org/api_keys)
- [GitHub - Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
