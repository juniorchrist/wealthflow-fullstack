# WealthFlow Backend V2

Backend API pour l'application WealthFlow V2 - Gestion financière personnelle.

## 🚀 Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Langage**: TypeScript
- **ORM**: Prisma
- **Base de données**: PostgreSQL (Supabase)
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Sécurité**: Helmet, CORS, bcrypt, Rate Limiting
- **Logging**: Winston

## 📁 Structure du projet

```
backend/
├── src/
│   ├── config/          # Configuration (env, database)
│   ├── middleware/      # Middlewares (auth, validation, errors)
│   ├── routes/          # Routes Express
│   ├── controllers/     # Controllers (logique HTTP)
│   ├── services/        # Services (logique métier)
│   ├── repositories/    # Repositories (accès données)
│   ├── validators/      # Schémas Zod
│   ├── utils/           # Utilitaires (JWT, hash, logger)
│   ├── types/           # Types TypeScript
│   ├── lib/             # Librairies (Prisma client)
│   ├── app.ts           # Configuration Express
│   └── server.ts        # Point d'entrée
├── prisma/
│   ├── schema.prisma    # Schéma de base de données
│   ├── seed.ts          # Données de seed
│   └── migrations/      # Migrations
├── logs/                # Logs de l'application
├── .env                 # Variables d'environnement
├── .env.example         # Template des variables
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Installation

### Prérequis

- Node.js >= 18.x
- npm ou yarn
- PostgreSQL (ou compte Supabase)

### Étapes

1. **Installer les dépendances**

```bash
cd backend
npm install
```

2. **Configurer les variables d'environnement**

Copier `.env.example` vers `.env` et remplir les valeurs :

```bash
cp .env.example .env
```

Variables importantes :
- `DATABASE_URL` : URL de connexion PostgreSQL/Supabase
- `JWT_SECRET` : Secret pour les access tokens
- `JWT_REFRESH_SECRET` : Secret pour les refresh tokens
- `FRONTEND_URL` : URL du frontend (pour CORS)

3. **Initialiser Prisma**

```bash
npm run prisma:generate
```

4. **Créer la base de données**

```bash
npm run prisma:migrate
```

5. **Seed les données (catégories par défaut)**

```bash
npm run prisma:seed
```

## 🚀 Développement

Lancer le serveur en mode développement (hot reload) :

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

## 🏗️ Build & Production

### Build

```bash
npm run build
```

Les fichiers compilés sont dans `dist/`

### Lancer en production

```bash
npm start
```

## 📋 Scripts disponibles

- `npm run dev` - Démarrer en mode développement (hot reload)
- `npm run build` - Compiler TypeScript vers JavaScript
- `npm start` - Lancer le serveur en production
- `npm run prisma:generate` - Générer le client Prisma
- `npm run prisma:migrate` - Créer/appliquer les migrations
- `npm run prisma:deploy` - Appliquer les migrations en production
- `npm run prisma:seed` - Seed les données
- `npm run prisma:studio` - Ouvrir Prisma Studio (GUI)

## 🔐 Authentification

L'API utilise JWT avec deux types de tokens :

- **Access Token** : Valide 15 minutes, utilisé pour les requêtes
- **Refresh Token** : Valide 7 jours, stocké en DB, permet de renouveler l'access token

### Headers requis

```
Authorization: Bearer {access_token}
```

## 📡 Endpoints API

### Health Check
- `GET /health` - Status de l'API
- `GET /api/health` - Status API + Database

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/refresh` - Renouveler l'access token
- `POST /api/auth/logout` - Déconnexion

### Transactions
- `GET /api/transactions` - Liste des transactions (avec filtres)
- `POST /api/transactions` - Créer une transaction
- `GET /api/transactions/:id` - Détails d'une transaction
- `PATCH /api/transactions/:id` - Modifier une transaction
- `DELETE /api/transactions/:id` - Supprimer une transaction

### Categories
- `GET /api/categories` - Liste des catégories
- `POST /api/categories` - Créer une catégorie
- `PATCH /api/categories/:id` - Modifier une catégorie
- `DELETE /api/categories/:id` - Supprimer une catégorie

### Savings Goals
- `GET /api/savings-goals` - Liste des objectifs
- `POST /api/savings-goals` - Créer un objectif
- `GET /api/savings-goals/:id` - Détails d'un objectif
- `PATCH /api/savings-goals/:id` - Modifier un objectif
- `DELETE /api/savings-goals/:id` - Supprimer un objectif
- `POST /api/savings-goals/:id/deposits` - Ajouter un versement

### Dashboard
- `GET /api/dashboard/summary` - Résumé du dashboard

### Notifications
- `GET /api/notifications` - Liste des notifications
- `PATCH /api/notifications/:id/read` - Marquer comme lu
- `PATCH /api/notifications/read-all` - Tout marquer comme lu
- `DELETE /api/notifications/:id` - Supprimer une notification

### Settings
- `GET /api/settings` - Paramètres utilisateur
- `PATCH /api/settings` - Modifier les paramètres

### Analytics
- `GET /api/analytics/monthly` - Données mensuelles
- `GET /api/analytics/categories` - Dépenses par catégorie
- `GET /api/analytics/savings-rate` - Taux d'épargne

## 🔒 Sécurité

- **Helmet** : Headers HTTP sécurisés
- **CORS** : Origine restreinte au frontend
- **Rate Limiting** : 100 req/15min par défaut
- **bcrypt** : Passwords hashés (10 rounds)
- **JWT** : Tokens signés et expirables
- **Validation** : Tous les inputs validés avec Zod
- **Isolation** : Filtrage strict par userId

## 🗄️ Base de données

### Modèles Prisma

- **User** : Utilisateurs
- **RefreshToken** : Tokens de refresh
- **Account** : Comptes financiers
- **Category** : Catégories de transactions
- **Transaction** : Transactions financières
- **SavingsGoal** : Objectifs d'épargne
- **SavingsDeposit** : Versements vers objectifs
- **Notification** : Notifications système

### Migrations

Créer une nouvelle migration :

```bash
npm run prisma:migrate -- --name nom_de_la_migration
```

## 📊 Logs

Les logs sont stockés dans `logs/` :
- `error.log` : Erreurs uniquement
- `combined.log` : Tous les logs

Les données sensibles (passwords, tokens, PIN) sont automatiquement masquées.

## 🚢 Déploiement (Render)

### Configuration requise

1. **Variables d'environnement sur Render** :
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `FRONTEND_URL`
   - `NODE_ENV=production`

2. **Build Command** :
   ```bash
   npm install && npm run prisma:generate && npm run build
   ```

3. **Start Command** :
   ```bash
   npm run prisma:deploy && npm start
   ```

## 📝 Notes de développement

### Ajout d'une nouvelle route

1. Créer le validator dans `src/validators/`
2. Créer le repository dans `src/repositories/`
3. Créer le service dans `src/services/`
4. Créer le controller dans `src/controllers/`
5. Créer la route dans `src/routes/`
6. Importer la route dans `src/routes/index.ts`

### Conventions de code

- **Controllers** : Gèrent HTTP uniquement (req, res, next)
- **Services** : Contiennent la logique métier
- **Repositories** : Accèdent à Prisma/DB uniquement
- **Validators** : Schémas Zod pour validation
- **Types** : Interfaces TypeScript partagées

## 🤝 Contribution

Ce projet fait partie de WealthFlow V2. Pour contribuer :

1. Fork le repo
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - WealthFlow Team 2026

## 🆘 Support

Pour toute question ou problème :
- Email : support@wealthflow.com
- Issues : GitHub Issues

---

**WealthFlow V2 Backend** - Développé avec ❤️ par l'équipe WealthFlow
