# 🚀 Guide de Déploiement GRATUIT sur Railway

## 💰 Plan Gratuit Railway
- **500 heures/mois** de runtime (largement suffisant)
- **Déploiement automatique** depuis GitHub
- **HTTPS automatique** 
- **Variables d'environnement sécurisées**
- **Support Docker complet**

## 📋 Étapes de déploiement (15 minutes)

### 1. 📦 Préparation du projet

Votre projet est déjà prêt ! ✅
- `docker-compose.yml` configuré
- `railway.json` optimisé pour le plan gratuit
- MongoDB Atlas configuré
- Variables d'environnement dans `.env`

### 2. 🚀 Déploiement sur Railway

1. **Créer un compte Railway**
   - Allez sur [railway.app](https://railway.app)
   - Connectez-vous avec GitHub
   - C'est gratuit !

2. **Créer un nouveau projet**
   - Cliquez "New Project"
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez votre repo `DAD-Equipe-6`

3. **Configuration automatique**
   - Railway détecte automatiquement votre `docker-compose.yml`
   - Il va créer des services pour chaque container

4. **Ajouter les variables d'environnement**
   Dans Railway, ajoutez ces variables pour TOUS les services :
   ```
   MONGODB_URI=mongodb+srv://chevilly2:FUhUEEmz7ZjvF7N9h@breezycluster.3iyzvzc.mongodb.net/?retryWrites=true&w=majority&appName=BreezyCluster
   ACCESS_JWT_KEY=dazhbdajbdjadakd
   REFRESH_TOKEN_SECRET=djendiebdeuibdeuidiue
   NODE_ENV=production
   ```

5. **Déploiement automatique**
   - Railway build et déploie automatiquement
   - Vous obtiendrez des URLs comme :
     - Frontend: `https://frontend-production-xxxx.up.railway.app`
     - Auth: `https://auth-service-production-xxxx.up.railway.app`
     - Posts: `https://post-service-production-xxxx.up.railway.app`

### 3. 🔧 Mise à jour des CORS

Une fois déployé, mettez à jour vos fichiers CORS avec les nouvelles URLs Railway.

## 💡 Optimisations pour rester gratuit

### ✅ Configuration actuelle optimisée
- `sleepApplication: true` - Les services s'endorment quand inutilisés
- `numReplicas: 1` - Une seule instance par service
- `builder: DOCKERFILE` - Utilise votre Docker optimisé

### 📊 Monitoring du plan gratuit
- Railway vous montre votre usage en temps réel
- 500h/mois = ~16h par jour (très généreux)
- Les apps s'endorment automatiquement = économie d'heures

## 🆚 Alternatives gratuites

| Plateforme | Frontend | Backend | Base de données |
|------------|----------|---------|-----------------|
| **Railway** | ✅ | ✅ | ✅ (ou Atlas) |
| Vercel + Railway | ✅ (Vercel) | ✅ (Railway) | ✅ (Atlas) |
| Heroku | ⚠️ (limité) | ⚠️ (limité) | ⚠️ (payant) |
| Render | ✅ | ⚠️ (limité) | ⚠️ (limité) |

**Railway est le meilleur choix gratuit pour votre projet !**

## 🚀 Commandes de test avant déploiement

```bash
# Tester en local
docker-compose up --build

# Vérifier que tout fonctionne sur localhost:80
```

## 📱 Après le déploiement

1. **URLs générées** - Railway vous donnera les URLs publiques
2. **HTTPS automatique** - Certificats SSL gratuits
3. **Monitoring** - Dashboard pour surveiller l'usage
4. **Logs en temps réel** - Debug facile

## ⚡ Déploiement en une commande

Si vous voulez utiliser Railway CLI :
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Déployer
railway up
```

---

## 🎯 Prêt à déployer ?

Votre projet est **100% prêt** pour Railway ! 
Suivez les étapes ci-dessus et vous aurez votre app en ligne en 15 minutes.
