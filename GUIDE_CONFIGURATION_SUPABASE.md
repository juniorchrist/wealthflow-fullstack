# 🔧 GUIDE DE CONFIGURATION AVEC SUPABASE

Ce guide vous aide à connecter le backend WealthFlow V2 à votre base PostgreSQL Supabase existante.

---

## 📋 PRÉREQUIS

Vous devez avoir :
- ✅ Un compte Supabase
- ✅ Un projet Supabase créé
- ✅ Une base PostgreSQL déjà créée avec les tables WealthFlow

---

## 🔑 ÉTAPE 1 : RÉCUPÉRER LA CONNECTION STRING

### 1.1 Aller sur votre projet Supabase

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet WealthFlow

### 1.2 Récupérer la Connection String

1. Dans le menu latéral, cliquez sur **Settings** (⚙️)
2. Cliquez sur **Database**
3. Descendez jusqu'à la section **Connection string**
4. Sélectionnez l'onglet **URI**
5. Copiez la chaîne qui ressemble à :
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

⚠️ **IMPORTANT** : Remplacez `[YOUR-PASSWORD]` par le mot de passe réel de votre base.

**Où trouver le mot de passe ?**
- C'est le mot de passe que vous avez défini lors de la création du projet
- Si vous l'avez oublié, vous pouvez le réinitialiser dans Settings > Database > Database Password

---

## ⚙️ ÉTAPE 2 : CONFIGURER LE BACKEND

### 2.1 Mettre à jour le fichier `.env`

1. Ouvrez le fichier `backend/.env`
2. Remplacez la ligne `DATABASE_URL=...` par votre connection string :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxxxx.supabase.co:5432/postgres"
```

**Exemple réel** :
```env
DATABASE_URL="postgresql://postgres:MyP@ssw0rd!@db.abcdefgh.supabase.co:5432/postgres"
```

### 2.2 Configurer les autres variables

Assurez-vous que ces variables sont définies dans `.env` :

```env
# Database
DATABASE_URL="postgresql://postgres:..."

# Server
PORT=5000
NODE_ENV=development

# JWT - CHANGEZ CES SECRETS EN PRODUCTION
JWT_SECRET="wealthflow-super-secret-jwt-key-2026-dev-changez-moi"
JWT_REFRESH_SECRET="wealthflow-super-secret-refresh-key-2026-dev-changez-moi"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Frontend
FRONTEND_URL="http://localhost:5173"

# Security
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🔄 ÉTAPE 3 : VÉRIFIER LA CONNEXION

### 3.1 Tester la connexion Prisma

```bash
cd backend
npm run prisma:studio
```

Si la connexion fonctionne, **Prisma Studio** s'ouvrira dans votre navigateur sur `http://localhost:5555` et vous verrez vos tables.

**Résultat attendu** :
- ✅ Prisma Studio s'ouvre
- ✅ Vous voyez les tables : users, accounts, categories, transactions, etc.
- ✅ Vous pouvez voir les données existantes

**En cas d'erreur** :
- ❌ `Error: P1001: Can't reach database server` → Vérifiez la CONNECTION_STRING
- ❌ `Error: Invalid database credentials` → Vérifiez le mot de passe
- ❌ `Error: SSL connection required` → Ajoutez `?sslmode=require` à la fin de l'URL

### 3.2 Vérifier le schéma

```bash
npm run prisma:generate
```

Cela génère le client Prisma basé sur votre base existante.

---

## 🚀 ÉTAPE 4 : LANCER LE SERVEUR

```bash
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:5000`

**Logs attendus** :
```
🚀 WealthFlow API v2.0.0 démarrée
📡 Serveur en écoute sur le port 5000
🌍 Environnement: development
🔗 URL: http://localhost:5000
💚 Health check: http://localhost:5000/api/health
```

---

## ✅ ÉTAPE 5 : TESTER L'API

### 5.1 Test du health check

Ouvrez votre navigateur ou utilisez curl :

```bash
curl http://localhost:5000/api/health
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "API et base de données opérationnelles",
  "database": "connected",
  "timestamp": "2026-09-08T..."
}
```

✅ Si `"database": "connected"` apparaît, **la connexion Supabase fonctionne** !

### 5.2 Test de l'inscription

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Junior",
    "lastName": "Diploh",
    "email": "junior.test@wealthflow.com",
    "password": "password123",
    "currency": "FCFA"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "user": {
      "id": "clxxxx...",
      "email": "junior.test@wealthflow.com",
      "firstName": "Junior",
      "lastName": "Diploh",
      ...
    },
    "tokens": {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG..."
    }
  }
}
```

✅ Si vous recevez un `accessToken`, **l'authentification fonctionne** !

### 5.3 Vérifier dans Prisma Studio

1. Retournez dans Prisma Studio (`http://localhost:5555`)
2. Cliquez sur la table **User**
3. Vous devriez voir votre nouvel utilisateur !

---

## 🔍 VÉRIFICATION DES TABLES EXISTANTES

### Tables attendues dans Supabase

Votre base doit contenir ces tables :
- ✅ `users`
- ✅ `accounts`
- ✅ `categories`
- ✅ `transactions`
- ✅ `budgets`
- ✅ `budget_categories`
- ✅ `savings_goals`
- ✅ `savings_deposits`
- ✅ `notifications`
- ✅ `_prisma_migrations` (table Prisma interne)

### Si une table manque

Si certaines tables n'existent pas encore, le schéma Prisma actuel peut créer ce qui manque.

**Option 1 : Créer uniquement les tables manquantes**
```bash
npm run prisma:migrate -- --name add_missing_tables
```

**Option 2 : Initialiser toutes les tables (si base vide)**
```bash
npm run prisma:migrate -- --name init
```

⚠️ **ATTENTION** : Ne jamais utiliser `prisma migrate reset` si vous avez déjà des données !

---

## 📊 SEED DES CATÉGORIES PAR DÉFAUT

Si votre base n'a pas encore de catégories par défaut :

```bash
npm run prisma:seed
```

Cela créera 9 catégories :
- 7 catégories de dépenses (Alimentation, Transport, etc.)
- 2 catégories de revenus (Salaire, Freelance)

---

## 🐛 DÉPANNAGE

### Erreur : Can't reach database server

**Cause** : La DATABASE_URL est incorrecte ou le serveur Supabase est inaccessible.

**Solutions** :
1. Vérifiez que l'URL commence par `postgresql://postgres:...`
2. Vérifiez que le mot de passe est correct
3. Vérifiez que votre IP n'est pas bloquée (Supabase autorise tout par défaut)
4. Testez la connexion avec un client PostgreSQL (pgAdmin, DBeaver)

### Erreur : Password authentication failed

**Cause** : Le mot de passe est incorrect.

**Solution** :
1. Allez dans Settings > Database > Database Password
2. Cliquez sur "Reset Database Password"
3. Copiez le nouveau mot de passe
4. Mettez à jour `.env`

### Erreur : SSL connection required

**Cause** : Supabase nécessite une connexion SSL.

**Solution** :
Ajoutez `?sslmode=require` à la fin de votre DATABASE_URL :
```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?sslmode=require"
```

### Erreur : relation "users" does not exist

**Cause** : Les tables n'existent pas encore dans la base.

**Solution** :
```bash
npm run prisma:migrate -- --name init
```

### Le serveur ne démarre pas

**Vérifications** :
1. Port 5000 déjà utilisé ? Changez `PORT=5001` dans `.env`
2. Node.js installé ? `node --version` (nécessite >= 18.x)
3. Dependencies installées ? `npm install`
4. TypeScript compilé ? `npm run build`

---

## ✅ CHECKLIST FINALE

Avant de continuer, vérifiez que :
- [ ] `DATABASE_URL` est configurée dans `.env`
- [ ] `npm run prisma:studio` fonctionne et affiche les tables
- [ ] `npm run dev` démarre le serveur sans erreur
- [ ] `GET /api/health` retourne `"database": "connected"`
- [ ] `POST /api/auth/register` crée un utilisateur
- [ ] Le nouvel utilisateur apparaît dans Prisma Studio

---

## 🎯 PROCHAINES ÉTAPES

Une fois la configuration terminée :

**Option B** : Continuer l'implémentation (Transactions, Categories, etc.)
**Option C** : Déployer sur Render

---

**Besoin d'aide ?** Consultez la documentation Supabase : https://supabase.com/docs/guides/database

---

**WealthFlow V2** - Configuration Supabase
