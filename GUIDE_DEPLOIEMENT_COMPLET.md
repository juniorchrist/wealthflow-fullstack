# 🚀 GUIDE COMPLET : DÉPLOIEMENT WEALTHFLOW (BACKEND + FRONTEND)

**Objectif** : Connecter votre frontend Netlify avec votre backend Render

---

## 📋 PLAN D'ACTION

1. ✅ Préparer le backend pour le déploiement
2. 🚀 Déployer sur Render
3. 🔗 Connecter le frontend Netlify
4. 🧪 Tester l'intégration complète

---

## PARTIE 1 : DÉPLOYER LE BACKEND SUR RENDER

### ÉTAPE 1 : Créer un compte Render (si pas déjà fait)

1. Allez sur https://render.com
2. Cliquez sur **"Get Started for Free"**
3. Connectez-vous avec GitHub

---

### ÉTAPE 2 : Créer un nouveau Web Service

1. Dans le Dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"Web Service"**
3. Connectez votre repo GitHub WealthFlow
   - Si le repo n'apparaît pas, cliquez sur **"Configure account"** pour autoriser l'accès
4. Une fois le repo sélectionné, vous verrez la page de configuration

---

### ÉTAPE 3 : Configuration du Service

#### **Paramètres de base** :

| Champ | Valeur |
|-------|--------|
| **Name** | `wealthflow-backend` |
| **Region** | `Frankfurt (EU Central)` ou le plus proche |
| **Branch** | `main` (ou votre branche) |
| **Root Directory** | `backend` ⚠️ IMPORTANT |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run prisma:generate && npm run build` |
| **Start Command** | `npm run prisma:deploy && npm start` |

#### **Instance Type** :
- Sélectionnez **"Free"** pour commencer

#### **Advanced** (optionnel) :
- **Health Check Path** : `/health`
- **Auto-Deploy** : ✅ Activé (déploiement automatique sur push)

---

### ÉTAPE 4 : Variables d'environnement ⚠️ CRITIQUE

Cliquez sur **"Environment"** et ajoutez ces variables :

#### 1. **NODE_ENV**
```
production
```

#### 2. **PORT**
```
5000
```

#### 3. **DATABASE_URL**
Votre URL Supabase complète (celle dans votre `.env` local) :
```
postgresql://postgres.xxxxx:[VOTRE-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

#### 4. **JWT_SECRET**
⚠️ **NE PAS utiliser celui du développement !**

**Générez un nouveau secret** :
```bash
# Dans votre terminal local
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copiez le résultat (ex: `3f8b2a9c7d1e4f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0`)

#### 5. **JWT_REFRESH_SECRET**
⚠️ **Générez un AUTRE secret différent** :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 6. **FRONTEND_URL**
L'URL de votre frontend Netlify (SANS slash final) :
```
https://votre-app.netlify.app
```

#### 7. **JWT_EXPIRES_IN**
```
15m
```

#### 8. **JWT_REFRESH_EXPIRES_IN**
```
7d
```

#### 9. **BCRYPT_ROUNDS**
```
10
```

---

### ÉTAPE 5 : Lancer le déploiement

1. Vérifiez que toutes les variables sont bien configurées
2. Cliquez sur **"Create Web Service"**
3. Render va commencer le déploiement (5-10 minutes)

**Vous verrez** :
- ⏳ Building...
- ⏳ Deploying...
- ✅ Live (une fois terminé)

---

### ÉTAPE 6 : Vérifier le déploiement

Une fois **"Live"**, votre backend sera accessible à une URL du type :
```
https://wealthflow-backend.onrender.com
```

**Testez immédiatement** :

#### Test 1 : Health Check
```bash
curl https://wealthflow-backend.onrender.com/health
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "WealthFlow API is running",
  "timestamp": "2026-09-08T...",
  "environment": "production"
}
```

#### Test 2 : Health Check avec DB
```bash
curl https://wealthflow-backend.onrender.com/api/health
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "API et base de données opérationnelles",
  "database": "connected",
  "timestamp": "..."
}
```

✅ **Si ces tests fonctionnent, votre backend est opérationnel !**

---

## PARTIE 2 : CONNECTER LE FRONTEND NETLIFY

### ÉTAPE 7 : Récupérer l'URL du backend Render

Copiez l'URL de votre backend Render (sans slash final) :
```
https://wealthflow-backend.onrender.com
```

---

### ÉTAPE 8 : Configurer les variables Netlify

1. Allez sur https://app.netlify.com
2. Sélectionnez votre site **WealthFlow**
3. Cliquez sur **"Site configuration"** (ou **"Site settings"**)
4. Dans le menu latéral : **"Environment variables"**
5. Cliquez sur **"Add a variable"** ou **"Edit variables"**

#### Variables à ajouter/modifier :

| Variable | Valeur |
|----------|--------|
| `VITE_API_URL` | `https://wealthflow-backend.onrender.com/api` |

⚠️ **IMPORTANT** : Notez le `/api` à la fin !

6. Cliquez sur **"Save"**

---

### ÉTAPE 9 : Redéployer le frontend

Maintenant que les variables sont mises à jour, redéployez :

**Option 1 : Depuis Netlify Dashboard**
1. Allez dans **"Deploys"**
2. Cliquez sur **"Trigger deploy"**
3. Sélectionnez **"Deploy site"**

**Option 2 : Push sur GitHub**
```bash
git add .
git commit -m "Update API URL to Render backend"
git push origin main
```

Netlify redéploiera automatiquement.

---

### ÉTAPE 10 : Vérifier la connexion Frontend ↔ Backend

1. Une fois le frontend redéployé, ouvrez votre app Netlify
2. Ouvrez la console du navigateur (F12)
3. Essayez de vous inscrire ou connecter
4. Vérifiez dans la console qu'il n'y a pas d'erreur CORS

**Si tout fonctionne** :
- ✅ Inscription fonctionne
- ✅ Connexion fonctionne
- ✅ Dashboard charge les données
- ✅ Pas d'erreur CORS dans la console

---

## PARTIE 3 : TESTS COMPLETS

### Test de bout en bout

1. **Inscription** :
   - Créez un nouveau compte sur votre app Netlify
   - Vérifiez que vous recevez un token

2. **Connexion** :
   - Connectez-vous avec le compte créé
   - Vérifiez que le dashboard charge

3. **Transactions** :
   - Créez une transaction
   - Vérifiez qu'elle apparaît dans la liste

4. **Dashboard** :
   - Vérifiez que les statistiques s'affichent
   - Balance, revenus, dépenses, etc.

---

## 🐛 DÉPANNAGE FRÉQUENT

### Problème 1 : CORS Error

**Symptôme** : Erreur dans la console du frontend
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Solution** :
1. Vérifiez que `FRONTEND_URL` dans Render correspond EXACTEMENT à l'URL Netlify
2. Pas de slash final dans l'URL
3. Redéployez le backend Render après modification

---

### Problème 2 : 503 Database Error

**Symptôme** : `/api/health` retourne `"database": "disconnected"`

**Solution** :
1. Vérifiez `DATABASE_URL` dans les variables Render
2. Assurez-vous que l'URL Supabase est complète avec le mot de passe
3. Testez la connexion depuis votre local avec cette URL

---

### Problème 3 : Build fails sur Render

**Symptôme** : Erreur durant le build

**Solutions** :
1. Vérifiez que **Root Directory** = `backend`
2. Vérifiez les commandes build/start
3. Consultez les logs dans Render Dashboard

---

### Problème 4 : Frontend ne se connecte pas

**Symptôme** : Erreur réseau dans le frontend

**Solution** :
1. Vérifiez que `VITE_API_URL` est correct dans Netlify
2. Doit se terminer par `/api`
3. Redéployez le frontend après modification des variables

---

### Problème 5 : Service s'endort (Free plan)

**Symptôme** : Première requête lente (30-60s)

**Explication** : Le plan gratuit Render met le service en veille après 15 min d'inactivité

**Solutions** :
- **Gratuit** : Accepter le délai initial
- **Payant** : Passer au plan Starter ($7/mois) pour éviter la mise en veille

---

## ✅ CHECKLIST FINALE

Avant de considérer le déploiement terminé :

### Backend Render :
- [ ] Service déployé et **"Live"**
- [ ] `/health` retourne success
- [ ] `/api/health` retourne `"database": "connected"`
- [ ] Variables d'environnement configurées
- [ ] Nouveaux secrets JWT générés

### Frontend Netlify :
- [ ] `VITE_API_URL` configuré
- [ ] Site redéployé
- [ ] Pas d'erreur CORS dans la console

### Tests fonctionnels :
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Dashboard charge les données
- [ ] Transactions créées/affichées
- [ ] Navigation fluide

---

## 🎉 SUCCÈS !

Si tous les tests passent, **FÉLICITATIONS** ! 🎊

Votre application WealthFlow V2 est maintenant **100% déployée et fonctionnelle** :

✅ **Backend** : https://wealthflow-backend.onrender.com  
✅ **Frontend** : https://votre-app.netlify.app  
✅ **Database** : Supabase PostgreSQL  
✅ **38 endpoints** opérationnels  
✅ **Sécurité** production-ready  

---

## 📊 SURVEILLANCE

### Render Dashboard
- **Logs** : Voir les logs en temps réel
- **Metrics** : CPU, Memory, Requests
- **Events** : Déploiements, restarts

### Netlify Dashboard
- **Analytics** : Visites, pages vues
- **Functions** : Si vous ajoutez des Netlify Functions
- **Deploy logs** : Historique des déploiements

---

## 💰 COÛTS ESTIMÉS

| Service | Plan | Coût |
|---------|------|------|
| **Render** | Free | $0/mois |
| **Netlify** | Free | $0/mois |
| **Supabase** | Free | $0/mois |
| **TOTAL** | | **$0/mois** |

**Limites du plan Free** :
- Render : 750h/mois, mise en veille après 15 min
- Netlify : 100 GB bandwidth, 300 build minutes
- Supabase : 500 MB database, 2 GB bandwidth

**Pour passer en production sérieuse** :
- Render Starter : $7/mois
- Netlify Pro : $19/mois
- Supabase Pro : $25/mois
- **TOTAL** : ~$51/mois

---

## 🚀 PROCHAINES ÉTAPES

1. **Tester intensivement** l'application
2. **Monitorer** les performances (Render Metrics)
3. **Collecter** les retours utilisateurs
4. **Optimiser** si nécessaire
5. **Scaler** quand le trafic augmente

---

**WealthFlow V2** — Guide de déploiement complet  
**Développé avec ❤️** — Prêt pour production !

Date : Septembre 2026
