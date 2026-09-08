# 🧪 GUIDE DE TEST DU BACKEND WEALTHFLOW V2

Ce guide explique comment tester le backend localement.

---

## ⚠️ PRÉREQUIS

Pour tester complètement le backend, vous avez besoin d'une base de données PostgreSQL.

### Option 1 : Base de données locale (PostgreSQL)

1. Installer PostgreSQL localement
2. Créer une base de données : `createdb wealthflow`
3. Mettre à jour `.env` :
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/wealthflow?schema=public"
   ```

### Option 2 : Supabase (recommandé)

1. Créer un compte sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer la "Connection string" (dans Settings > Database)
4. Mettre à jour `.env` :
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

---

## 🚀 ÉTAPES DE TEST

### 1. Installation des dépendances

```bash
cd backend
npm install
```

### 2. Générer le client Prisma

```bash
npm run prisma:generate
```

### 3. Créer la base de données et les tables

```bash
npm run prisma:migrate
```

Cela va créer la première migration et créer toutes les tables.

### 4. Seed les données (catégories par défaut)

```bash
npm run prisma:seed
```

Cela va créer les 9 catégories par défaut.

### 5. Lancer le serveur en mode développement

```bash
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:5000`

### 6. Tester le health check

Ouvrir le navigateur ou utiliser curl :

```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/health
```

Vous devriez voir :
```json
{
  "success": true,
  "message": "API et base de données opérationnelles",
  "database": "connected",
  "timestamp": "..."
}
```

---

## 🧪 TESTER L'AUTHENTIFICATION

### Option 1 : Avec Thunder Client (VS Code)

1. Installer l'extension "Thunder Client" dans VS Code
2. Créer une nouvelle requête

### Option 2 : Avec curl

#### 1. Inscription

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Junior Diploh",
    "email": "junior@test.com",
    "password": "password123",
    "currency": "FCFA"
  }'
```

Vous devriez recevoir :
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "user": {
      "id": "...",
      "email": "junior@test.com",
      "name": "Junior Diploh",
      ...
    },
    "tokens": {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG..."
    }
  }
}
```

**⚠️ IMPORTANT** : Copiez le `accessToken` pour les tests suivants !

#### 2. Connexion

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "junior@test.com",
    "password": "password123"
  }'
```

#### 3. Récupérer le profil (requiert le token)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

Remplacez `VOTRE_ACCESS_TOKEN` par le token reçu lors de l'inscription/connexion.

#### 4. Renouveler le token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "VOTRE_REFRESH_TOKEN"
  }'
```

#### 5. Déconnexion

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "VOTRE_REFRESH_TOKEN"
  }'
```

---

## 🔍 VÉRIFIER LES DONNÉES DANS LA BASE

### Option 1 : Prisma Studio (GUI)

```bash
npm run prisma:studio
```

Une interface web s'ouvrira sur `http://localhost:5555` où vous pourrez voir toutes les données.

### Option 2 : Requête SQL directe

```bash
npx prisma db execute --stdin <<< "SELECT * FROM \"User\";"
```

---

## 📊 STRUCTURE DES ENDPOINTS DISPONIBLES

| Méthode | Endpoint              | Description                    | Auth |
|---------|----------------------|--------------------------------|------|
| GET     | /health              | Health check API               | ❌   |
| GET     | /api/health          | Health check API + DB          | ❌   |
| POST    | /api/auth/register   | Inscription                    | ❌   |
| POST    | /api/auth/login      | Connexion                      | ❌   |
| GET     | /api/auth/me         | Profil utilisateur             | ✅   |
| POST    | /api/auth/refresh    | Renouveler les tokens          | ❌   |
| POST    | /api/auth/logout     | Déconnexion                    | ✅   |

---

## 🐛 DÉPANNAGE

### Erreur : "Error: P1001: Can't reach database server"

**Cause** : La base de données n'est pas accessible.

**Solutions** :
1. Vérifier que PostgreSQL est lancé
2. Vérifier `DATABASE_URL` dans `.env`
3. Tester la connexion : `npm run prisma:studio`

### Erreur : "Error: Environment variable not found: DATABASE_URL"

**Cause** : Le fichier `.env` n'est pas lu ou DATABASE_URL est mal configuré.

**Solutions** :
1. Vérifier que `.env` existe à la racine de `backend/`
2. Vérifier que `DATABASE_URL` est bien défini
3. Relancer le serveur

### Erreur : "Table does not exist"

**Cause** : Les migrations Prisma n'ont pas été exécutées.

**Solution** :
```bash
npm run prisma:migrate
```

### Erreur : "Token invalide ou expiré"

**Cause** : L'access token a expiré (durée de vie : 15 minutes).

**Solution** :
Utiliser le `refreshToken` pour en obtenir un nouveau :
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "VOTRE_REFRESH_TOKEN"}'
```

### Port 5000 déjà utilisé

**Solution** :
Changer le port dans `.env` :
```
PORT=5001
```

---

## 📝 LOGS

Les logs sont stockés dans `backend/logs/` :
- `error.log` — Erreurs uniquement
- `combined.log` — Tous les logs

En mode développement, les logs s'affichent aussi dans la console.

---

## ✅ CHECKLIST DE TEST

- [ ] `npm install` réussit
- [ ] `npm run prisma:generate` réussit
- [ ] `npm run prisma:migrate` réussit
- [ ] `npm run prisma:seed` réussit
- [ ] `npm run build` compile sans erreur
- [ ] `npm run dev` démarre le serveur
- [ ] `GET /health` retourne 200
- [ ] `GET /api/health` retourne 200 avec "database": "connected"
- [ ] `POST /api/auth/register` crée un utilisateur
- [ ] `POST /api/auth/login` connecte l'utilisateur
- [ ] `GET /api/auth/me` retourne le profil avec un token valide
- [ ] `GET /api/auth/me` retourne 401 sans token
- [ ] `POST /api/auth/refresh` renouvelle les tokens
- [ ] `POST /api/auth/logout` supprime le refresh token

---

## 🎯 PROCHAINES ÉTAPES

Une fois l'authentification testée et fonctionnelle, vous pourrez :

1. **Implémenter les transactions** (Sprint 3)
2. **Implémenter les catégories** (Sprint 3)
3. **Implémenter les savings goals** (Sprint 4)
4. **Implémenter le dashboard** (Sprint 4)
5. **Déployer sur Render** (Sprint 6)

---

## 📞 SUPPORT

Si vous rencontrez des problèmes :
1. Vérifier les logs dans `backend/logs/`
2. Vérifier la console du serveur
3. Vérifier Prisma Studio pour l'état de la DB
4. Créer une issue GitHub avec les logs d'erreur

---

**WealthFlow V2 Backend** - Développé avec ❤️
