# Guide de Déploiement WealthFlow
## Backend (Render) + Frontend (Netlify) + Base de données (Supabase)

---

## 📋 Étape 1 : Configuration Supabase (Base de données)

### 1.1 Obtenir la connexion Supabase
1. Connectez-vous à [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet ou créez-en un nouveau
3. Allez dans **Settings** → **Database**
4. Cherchez **Connection string** → **URI**
5. Copiez la chaîne de connexion

### 1.2 Format de la DATABASE_URL
Pour la production sur Render, utilisez le **Transaction Pooler** (recommandé) :
```
postgresql://postgres.xxxx:[VOTRE-MOT-DE-PASSE]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**Important :** Remplacez `[VOTRE-MOT-DE-PASSE]` par votre vrai mot de passe Supabase.

### 1.3 Exécuter les migrations Prisma
Une fois le backend déployé sur Render, vous devrez exécuter les migrations :
```bash
# Depuis votre terminal local
cd backend
npx prisma db push --schema=prisma/schema.prisma
```

---

## 🚀 Étape 2 : Déploiement Backend sur Render

### 2.1 Lier le repository GitHub
1. Connectez-vous à [https://dashboard.render.com](https://dashboard.render.com)
2. Cliquez sur **New +** → **Web Service**
3. Connectez votre compte GitHub et sélectionnez le repository `wealthflow-frontend` (ou le nom de votre repo complet)
4. Render détectera automatiquement le fichier `render.yaml`
5. Le fichier `render.yaml` configure `rootDir: backend`, donc Render travaillera uniquement dans le dossier backend/

### 2.2 Configuration des variables d'environnement Render
Dans le dashboard Render de votre service, ajoutez ces variables :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `NODE_ENV` | `production` | Environnement de production |
| `DATABASE_URL` | *voir étape 1.2* | Chaîne de connexion Supabase |
| `JWT_SECRET` | *générer un secret* | Clé secrète pour JWT (voir ci-dessous) |
| `JWT_EXPIRES_IN` | `7d` | Durée de validité des tokens |
| `CORS_ORIGIN` | *URL Netlify* | URL de votre frontend Netlify |

### 2.3 Générer JWT_SECRET
Exécutez cette commande pour générer un secret sécurisé :

**Sur Linux/Mac :**
```bash
openssl rand -base64 64
```

**Sur Windows (si openssl n'est pas disponible) :**
```bash
node generate-jwt-secret.js
```

Copiez le résultat et collez-le comme valeur de `JWT_SECRET`.

### 2.4 Configurer CORS_ORIGIN
Une fois votre frontend déployé sur Netlify, copiez son URL (ex: `https://wealthflow-app.netlify.app`) et collez-la comme valeur de `CORS_ORIGIN`.

**Note :** Vous pouvez mettre plusieurs origines séparées par des virgules :
```
https://wealthflow-app.netlify.app,https://autre-domaine.com
```

### 2.5 Déployer
1. Cliquez sur **Create Web Service**
2. Render construira et déploiera automatiquement
3. Attendez que le statut passe à "Live"
4. Notez l'URL de votre API (ex: `https://wealthflow-api.onrender.com`)

---

## 🌐 Étape 3 : Déploiement Frontend sur Netlify

### 3.1 Connecter le repository
1. Connectez-vous à [https://app.netlify.com](https://app.netlify.com)
2. Cliquez sur **Add new site** → **Import an existing project**
3. Connectez GitHub et sélectionnez le repository `wealthflow-corrige`
4. Netlify détectera automatiquement le fichier `netlify.toml`

### 3.2 Configuration des variables d'environnement Netlify
Dans **Site configuration** → **Environment variables**, ajoutez :

| Variable | Valeur |
|----------|--------|
| `VITE_API_URL` | URL de votre backend Render (ex: `https://wealthflow-api.onrender.com/api`) |

### 3.3 Déployer
1. Cliquez sur **Deploy site**
2. Attendez le déploiement
3. Notez l'URL de votre frontend (ex: `https://wealthflow-app.netlify.app`)

---

## 🔗 Étape 4 : Finaliser les connexions

### 4.1 Mettre à jour CORS_ORIGIN sur Render
1. Retournez sur votre dashboard Render
2. Allez dans **Environment** de votre service backend
3. Mettez à jour `CORS_ORIGIN` avec l'URL Netlify réelle
4. Redéployez le service (Render le fera automatiquement)

### 4.2 Vérifier la connexion
Testez que tout fonctionne :

**Backend API :**
```bash
curl https://wealthflow-api.onrender.com/api/health
```

**Frontend :**
Ouvrez votre URL Netlify dans le navigateur et testez l'inscription/connexion.

---

## 🐛 Dépannage

### Problème : CORS errors
- Vérifiez que `CORS_ORIGIN` sur Render contient l'URL exacte de Netlify
- Assurez-vous qu'il n'y a pas de slash final (`/`) dans l'URL

### Problème : Database connection failed
- Vérifiez que `DATABASE_URL` est correcte
- Assurez-vous d'utiliser le Transaction Pooler (port 6543) pour Render
- Vérifiez que le mot de passe Supabase est correct

### Problème : Build failed
- Vérifiez les logs de build sur Render
- Assurez-vous que `node_modules` n'est pas dans `.gitignore`
- Vérifiez que les scripts dans `package.json` sont corrects

### Problème : Frontend ne peut pas contacter l'API
- Vérifiez que `VITE_API_URL` sur Netlify pointe vers la bonne URL Render
- Assurez-vous que l'URL se termine par `/api`
- Vérifiez les logs du navigateur (F12) pour les erreurs réseau

---

## 📝 Résumé des URLs

Après déploiement, vous aurez :

- **Backend Render** : `https://wealthflow-api.onrender.com`
- **Frontend Netlify** : `https://wealthflow-app.netlify.app`
- **Base de données Supabase** : `https://[votre-projet].supabase.co`

Ces trois services seront connectés et votre application sera pleinement fonctionnelle.
