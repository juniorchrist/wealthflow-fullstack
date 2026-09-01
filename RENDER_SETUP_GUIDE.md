# 🔧 Guide Complet - Configuration Render

Voici un guide étape par étape pour configurer et déployer votre application sur Render.

---

## 📋 Checklist Pré-Déploiement

- [x] TypeScript compilation fixée ✅
- [x] Dependencies installées ✅
- [x] render.yaml configuré ✅
- [ ] Variables d'environnement définies (À faire)
- [ ] JWT_SECRET généré (À faire)
- [ ] Déploiement lancé (À faire)

---

## 🔑 ÉTAPE 1 : Générer un JWT_SECRET

Exécutez cette commande **localement** :

```bash
node generate-jwt-secret.js
```

**Vous obtiendrez une clé sécurisée comme** :
```
+K4PGcGjo8aALj00zB6M+G59Bf6dfOnqMGa+LYOkeQ3nKfwqmGu7kig5sqcLEi7t0mrnV2sljGcpvvuB8QJpfg==
```

**Gardez cette clé à portée de main pour l'étape suivante!** ⚠️

---

## 🌐 ÉTAPE 2 : Configuration Render Dashboard

### Allez sur https://dashboard.render.com

1. Sélectionnez votre service **wealthflow-api**
2. Cliquez sur **Settings** dans le menu de gauche
3. Scroll jusqu'à **Environment Variables**

---

## 📝 ÉTAPE 3 : Définir les Variables d'Environnement

Remplissez **EXACTEMENT** ces variables :

### **Variable 1 : NODE_ENV**
- **Key** : `NODE_ENV`
- **Value** : `production`
- Click **Save**

### **Variable 2 : DATABASE_URL**
- **Key** : `DATABASE_URL`
- **Value** : `postgresql://username:password@host.com:5432/database_name`

**Où trouver cette URL?**
- Si vous utilisez **Render PostgreSQL** : elle est fournie dans les Settings de la base de données
- Si vous utilisez **Supabase** : copier-coller depuis Project Settings > Database
- Si vous utilisez **AWS RDS** : construire l'URL avec vos credentials

**Exemple** :
```
postgresql://admin:mypassword123@db.render.com:5432/wealthflow_db
```

Click **Save**

### **Variable 3 : JWT_SECRET** ⚠️ TRÈS IMPORTANT
- **Key** : `JWT_SECRET`
- **Value** : **Collez la clé générée à l'étape 1**
  ```
  +K4PGcGjo8aALj00zB6M+G59Bf6dfOnqMGa+LYOkeQ3nKfwqmGu7kig5sqcLEi7t0mrnV2sljGcpvvuB8QJpfg==
  ```

Click **Save**

### **Variable 4 : JWT_EXPIRES_IN**
- **Key** : `JWT_EXPIRES_IN`
- **Value** : `7d`
- Click **Save**

### **Variable 5 : CORS_ORIGIN**
- **Key** : `CORS_ORIGIN`
- **Value** : **Votre URL frontend**
  - Si Netlify : `https://wealthflow.netlify.app`
  - Si Vercel : `https://wealthflow.vercel.app`
  - Si local : `http://localhost:3000`

Click **Save**

---

## ✅ Tableau Récapitulatif

| Variable | Valeur | Exemple |
|----------|--------|---------|
| `NODE_ENV` | `production` | `production` |
| `DATABASE_URL` | Connection PostgreSQL | `postgresql://admin:pass@host/db` |
| `JWT_SECRET` | Clé 64 caractères base64 | `+K4PGcGjo8aALj00zB6...` |
| `JWT_EXPIRES_IN` | Durée du token | `7d` |
| `CORS_ORIGIN` | URL du frontend | `https://wealthflow.netlify.app` |

---

## 🚀 ÉTAPE 4 : Lancer le Déploiement

### Option A : Redéploiement Automatique (Recommandé)

1. Attendez que Render détecte les changements GitHub (2-5 min)
2. Ou allez dans le tableau de bord et cliquez **Manual Deploy** > **Deploy Latest Commit**

### Option B : Vérifier le Statut

1. Cliquez sur **Deployments** en haut du tableau de bord
2. Vous devriez voir un déploiement "In Progress"
3. Attendez qu'il passe au status **Live** (vert)

**Logs à Surveiller** :
```
✔ Generated Prisma Client
> wealthflow-backend@2.0.0 build
> prisma generate && tsc --project tsconfig.json
> wealthflow-backend@2.0.0 start
> node dist/server.js
Server running on port 10000
```

---

## 🧪 ÉTAPE 5 : Tester le Déploiement

Une fois le service en état **Live** (vert), testez avec ces commandes :

### Test 1 : Health Check
```bash
curl https://wealthflow-api.onrender.com/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "timestamp": "2026-09-01T10:30:00Z",
  "uptime": 125,
  "db": "ok"
}
```

### Test 2 : Root API
```bash
curl https://wealthflow-api.onrender.com/
```

**Réponse attendue** :
```json
{
  "service": "WealthFlow API",
  "version": "2.0.0",
  "status": "online",
  "environment": "production"
}
```

### Test 3 : Depuis le Frontend
1. Ouvrez votre application WealthFlow
2. Essayez de vous **connecter** ou de faire une **requête API**
3. Vérifiez que **l'API répond correctement**

---

## 🔴 Dépannage - Si Ça Ne Marche Pas

### ❌ Service reste en "Building" ou "Deploying"
- **Attendez 5-10 minutes** (premier déploiement peut être lent)
- Allez dans **Logs > Deploy** pour voir la progression
- Si bloqué, cliquez **Cancel Deploy** et relancez

### ❌ Erreur : "Could not find a declaration file for module"
- ✅ C'est normal si c'était la première fois
- Notre `render.yaml` a **déjà corrigé ça** avec `npm ci --include=dev`
- Le déploiement devrait maintenant fonctionner

### ❌ Erreur de Démarrage : "Cannot find module"
- Allez dans **Settings > Clear Build Cache**
- Cliquez **Manual Deploy** et relancez

### ❌ Erreur Base de Données
- Vérifiez que `DATABASE_URL` est correcte
- Testez la connexion depuis votre machine :
  ```bash
  psql "postgresql://user:pass@host/db"
  ```

### ❌ Erreur CORS depuis Frontend
- Vérifiez que `CORS_ORIGIN` est l'URL exacte de votre frontend
- Rechargez la page avec `Ctrl+Shift+R` (hard refresh)

---

## 📞 Ressources Utiles

- 📖 Documentation Render : https://docs.render.com
- 🗺️ Fichiers de configuration : `DEPLOYMENT_FIXES.md`, `DEPLOYMENT_VERIFICATION.md`
- 🔐 Génération JWT : `generate-jwt-secret.js`

---

## ✨ Succès !

Si vous voyez ceci, c'est gagné :

✅ Service en état **Live** (vert)  
✅ `/api/health` répond  
✅ `/` répond  
✅ Frontend peut appeler l'API  
✅ Les utilisateurs peuvent se connecter  

---

**Date** : 2026-09-01  
**Status** : 🚀 Prêt pour déploiement
