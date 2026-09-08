# 🚀 DÉPLOIEMENT SUR RENDER - WEALTHFLOW BACKEND

## 📋 PRÉREQUIS

- ✅ Compte Render (https://render.com)
- ✅ Compte GitHub avec le repo WealthFlow
- ✅ Base de données Supabase configurée

---

## 🔧 CONFIGURATION RENDER

### 1. Créer un nouveau Web Service

1. Allez sur https://dashboard.render.com
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre repo GitHub
4. Sélectionnez le dossier `backend`

### 2. Configuration du Service

**Basic Settings** :
- **Name** : `wealthflow-backend`
- **Region** : `Frankfurt (EU Central)` (ou le plus proche de vous)
- **Branch** : `main` (ou votre branche principale)
- **Root Directory** : `backend`
- **Runtime** : `Node`
- **Build Command** : 
  ```bash
  npm install && npm run prisma:generate && npm run build
  ```
- **Start Command** : 
  ```bash
  npm run prisma:deploy && npm start
  ```

**Instance Type** :
- Choisissez **"Free"** pour commencer

### 3. Variables d'environnement (IMPORTANT !)

Ajoutez ces variables dans **"Environment"** :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | Votre URL Supabase complète |
| `JWT_SECRET` | Générez un secret fort (32+ caractères) |
| `JWT_REFRESH_SECRET` | Générez un autre secret fort |
| `FRONTEND_URL` | URL de votre frontend Netlify |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `BCRYPT_ROUNDS` | `10` |

**⚠️ IMPORTANT** : 
- Ne JAMAIS utiliser les secrets de développement en production
- Générez de nouveaux secrets forts pour `JWT_SECRET` et `JWT_REFRESH_SECRET`

**Générer des secrets forts** :
```bash
# Sur votre terminal local
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Health Check Path

Dans **"Health Check Path"**, entrez : `/health`

### 5. Déploiement

1. Cliquez sur **"Create Web Service"**
2. Render va automatiquement :
   - Cloner le repo
   - Installer les dépendances
   - Générer le client Prisma
   - Compiler TypeScript
   - Déployer les migrations
   - Démarrer le serveur

### 6. Vérification

Une fois déployé, vous aurez une URL du type :
```
https://wealthflow-backend.onrender.com
```

Testez :
```bash
curl https://wealthflow-backend.onrender.com/health
```

Réponse attendue :
```json
{
  "success": true,
  "message": "WealthFlow API is running",
  "timestamp": "...",
  "environment": "production"
}
```

---

## 🔗 CONNEXION AVEC LE FRONTEND NETLIFY

### 1. Mettre à jour les variables d'environnement Netlify

1. Allez sur https://app.netlify.com
2. Sélectionnez votre site WealthFlow
3. **Site settings** → **Environment variables**
4. Ajoutez/modifiez :
   - `VITE_API_URL` = `https://wealthflow-backend.onrender.com/api`

### 2. Redéployer le frontend

1. Dans Netlify : **Deploys** → **Trigger deploy** → **Deploy site**
2. Ou push un commit sur votre repo GitHub

---

## 🐛 DÉPANNAGE

### Problème : Build échoue

**Vérifiez** :
- Le Root Directory est bien `backend`
- Les commandes de build sont correctes
- Les variables d'environnement sont définies

### Problème : Erreur de connexion à la DB

**Vérifiez** :
- `DATABASE_URL` est bien configurée dans Render
- L'URL Supabase est complète avec le mot de passe
- Supabase autorise les connexions externes

### Problème : CORS errors depuis le frontend

**Vérifiez** :
- `FRONTEND_URL` dans Render correspond exactement à l'URL Netlify
- Pas de slash final dans l'URL

---

## 📊 SURVEILLANCE

### Logs

Dans Render Dashboard :
- **Logs** → Voir les logs en temps réel
- Utile pour débugger les erreurs

### Métriques

- **Metrics** → CPU, Memory, Response times
- Surveillez les performances

### Health Check

Render vérifie automatiquement `/health` toutes les minutes.
Si le serveur ne répond pas, il redémarre automatiquement.

---

## 💰 COÛTS

**Plan Free** :
- ✅ 750 heures/mois gratuites
- ⚠️ Le service s'endort après 15 min d'inactivité
- ⚠️ Premier démarrage peut prendre 30-60 secondes

**Plan Starter ($7/mois)** :
- ✅ Pas de mise en veille
- ✅ Démarrage instantané
- ✅ Meilleure pour la production

---

## 🔒 SÉCURITÉ

### Checklist avant production :

- [ ] Nouveaux secrets JWT générés
- [ ] `NODE_ENV=production`
- [ ] CORS configuré avec l'URL exacte du frontend
- [ ] Rate limiting activé
- [ ] Logs configurés
- [ ] Health check fonctionnel
- [ ] Variables d'environnement sécurisées

---

## ✅ RÉSULTAT FINAL

Après déploiement réussi :

✅ Backend accessible : `https://wealthflow-backend.onrender.com`  
✅ Frontend Netlify connecté  
✅ Base de données Supabase reliée  
✅ API REST complète (38 endpoints)  
✅ Sécurité production-ready  

**Votre application WealthFlow est maintenant en production !** 🎉

---

## 📚 RESSOURCES

- Render Docs : https://render.com/docs
- Prisma Deploy : https://www.prisma.io/docs/guides/deployment
- Supabase + Render : https://supabase.com/partners/integrations/render

---

**WealthFlow V2** — Déploiement Backend Render  
Date : Septembre 2026
