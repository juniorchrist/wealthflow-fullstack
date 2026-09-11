# PLAN D'IMPLÉMENTATION DU BACKEND WEALTHFLOW V2

Basé sur l'analyse complète du frontend V2

---

## PHASE 2 : DÉFINITION DES ENTITÉS ET RELATIONS

### Décisions architecturales

#### 1. Gestion du solde (Balance)
**Décision** : Calculer le solde dynamiquement à partir des transactions
- Ne pas stocker `currentBalance` dans Account (évite la désynchronisation)
- Calculer : `balance = initialBalance + sum(income) - sum(expense)`
- Option : Ajouter une transaction initiale de type `initial_balance`

#### 2. Comptes (Accounts)
**Décision** : Créer un modèle Account optionnel
- Un utilisateur peut avoir plusieurs comptes
- Si non spécifié, tout va dans un compte par défaut "Compte principal"
- Relations : Transaction.accountId → Account.id

#### 3. Catégories
**Décision** : Catégories globales + personnalisées
- Catégories par défaut : `userId = null`, `isDefault = true`
- Catégories perso : `userId = {userId}`, `isDefault = false`
- Ne PAS stocker `category` (string) dans Transaction, uniquement `categoryId`

#### 4. Budget
**Décision** : Calcul dynamique (pas de table Budget)
- Budget mensuel = somme des `budgetLimit` des catégories expense
- Budget par catégorie = dans la table Category
- Historisation si nécessaire → ajout ultérieur

#### 5. Objectifs d'épargne
**Décision** : Source de vérité = SavingsDeposit
- `SavingsGoal.currentAmount` = somme des `SavingsDeposit.amount`
- Chaque versement crée :
  1. Un `SavingsDeposit`
  2. Une `Transaction` de type `savings_deposit`
  3. Lien entre les deux

#### 6. Notifications
**Décision** : Notifications automatiques générées par le backend
- Déclencheurs :
  - Budget dépassé (80%, 100%)
  - Objectif atteint (50%, 100%)
  - Transaction inhabituelle (montant élevé)
  - Épargne recommandée

---

## PHASE 3 : CRÉATION DU BACKEND

### Structure des dossiers

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Prisma client
│   │   └── env.ts               # Validation .env
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification
│   │   ├── errorHandler.ts     # Global error handler
│   │   ├── validation.ts        # Zod validation
│   │   └── rateLimit.ts         # Rate limiting
│   ├── routes/
│   │   ├── index.ts             # Router principal
│   │   ├── auth.routes.ts
│   │   ├── transactions.routes.ts
│   │   ├── categories.routes.ts
│   │   ├── savings.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── notifications.routes.ts
│   │   ├── settings.routes.ts
│   │   └── analytics.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── transactions.controller.ts
│   │   ├── categories.controller.ts
│   │   ├── savings.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── notifications.controller.ts
│   │   ├── settings.controller.ts
│   │   └── analytics.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── transactions.service.ts
│   │   ├── categories.service.ts
│   │   ├── savings.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── notifications.service.ts
│   │   ├── settings.service.ts
│   │   └── analytics.service.ts
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── transaction.repository.ts
│   │   ├── category.repository.ts
│   │   ├── savings.repository.ts
│   │   └── notification.repository.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── transaction.validator.ts
│   │   ├── category.validator.ts
│   │   ├── savings.validator.ts
│   │   └── settings.validator.ts
│   ├── utils/
│   │   ├── jwt.ts               # JWT helpers
│   │   ├── hash.ts              # bcrypt helpers
│   │   ├── logger.ts            # Winston logger
│   │   └── currency.ts          # Format helpers
│   ├── types/
│   │   ├── express.d.ts         # Express types
│   │   └── api.types.ts         # API types
│   ├── lib/
│   │   └── prisma.ts            # Prisma singleton
│   ├── app.ts                   # Express app
│   └── server.ts                # Server entry
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── tests/
│   ├── unit/
│   └── integration/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## PHASE 4 : SCHÉMA PRISMA

### Modifications finales au schéma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String         @id @default(cuid())
  email             String         @unique
  passwordHash      String
  name              String
  phone             String?
  avatar            String?
  currency          String         @default("FCFA")
  language          String         @default("Français")
  timezone          String         @default("GMT +00:00")
  dateFormat        String         @default("DD/MM/YYYY")
  plan              String         @default("WealthFlow Pro")
  pinHash           String?
  isPinEnabled      Boolean        @default(false)
  autoLockMinutes   Int            @default(15)
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  
  accounts          Account[]
  transactions      Transaction[]
  categories        Category[]
  savingsGoals      SavingsGoal[]
  notifications     Notification[]
  refreshTokens     RefreshToken[]
  
  @@index([email])
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
}

model Account {
  id             String        @id @default(cuid())
  userId         String
  name           String
  type           String        @default("main") // "main", "card", "cash", "savings"
  initialBalance Float         @default(0)
  isDefault      Boolean       @default(false)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  
  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions   Transaction[]
  
  @@index([userId])
}

model Category {
  id           String        @id @default(cuid())
  userId       String?       // null = catégorie globale
  name         String
  icon         String
  color        String
  budgetLimit  Float         @default(0)
  type         String        // "expense" | "income"
  isDefault    Boolean       @default(false)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  
  user         User?         @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  
  @@index([userId])
  @@index([type])
}

model Transaction {
  id           String             @id @default(cuid())
  userId       String
  accountId    String?
  categoryId   String
  title        String
  amount       Float
  type         String             // "income" | "expense" | "savings_deposit"
  date         DateTime
  time         String?
  notes        String?
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
  
  user         User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  account      Account?           @relation(fields: [accountId], references: [id], onDelete: SetNull)
  category     Category           @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  deposit      SavingsDeposit?
  
  @@index([userId])
  @@index([categoryId])
  @@index([accountId])
  @@index([date])
  @@index([type])
}

model SavingsGoal {
  id                String           @id @default(cuid())
  userId            String
  title             String
  targetAmount      Float
  deadline          String           // Format libre pour l'instant
  icon              String
  color             String
  description       String?
  isAutoSaveActive  Boolean          @default(false)
  autoSaveAmount    Float?
  checkboxesCount   Int              @default(10)
  checkedBoxes      Json?            // Array of integers
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  
  user              User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  deposits          SavingsDeposit[]
  
  @@index([userId])
}

model SavingsDeposit {
  id             String       @id @default(cuid())
  goalId         String
  transactionId  String       @unique
  amount         Float
  date           DateTime
  notes          String?
  createdAt      DateTime     @default(now())
  
  goal           SavingsGoal  @relation(fields: [goalId], references: [id], onDelete: Cascade)
  transaction    Transaction  @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  
  @@index([goalId])
  @@index([date])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  type      String   // "info" | "warning" | "success" | "alert"
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([read])
  @@index([createdAt])
}
```

---

## PHASE 5 : VARIABLES D'ENVIRONNEMENT

### .env.example

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wealthflow?schema=public"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
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

## PHASE 6 : INSTALLATION

### package.json

```json
{
  "name": "wealthflow-backend",
  "version": "2.0.0",
  "description": "Backend API pour WealthFlow V2",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "keywords": ["wealthflow", "finance", "api"],
  "author": "WealthFlow Team",
  "license": "MIT",
  "dependencies": {
    "@prisma/client": "^5.20.0",
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.8",
    "dotenv": "^17.2.3",
    "winston": "^3.14.2",
    "express-rate-limit": "^7.4.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/cors": "^2.8.17",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.7",
    "typescript": "~5.8.2",
    "tsx": "^4.21.0",
    "prisma": "^5.20.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0"
  }
}
```

---

## PHASE 7 : ORDRE D'IMPLÉMENTATION

### Étape 1 : Setup initial (1h)
- [x] Créer dossier `backend/`
- [ ] Initialiser npm : `npm init -y`
- [ ] Installer dépendances
- [ ] Configurer TypeScript : `tsconfig.json`
- [ ] Configurer Prisma : `npx prisma init`
- [ ] Créer `.env` et `.env.example`
- [ ] Créer `.gitignore`

### Étape 2 : Prisma + Database (2h)
- [ ] Créer `schema.prisma` complet
- [ ] Configurer connexion Supabase
- [ ] Générer le client : `npx prisma generate`
- [ ] Créer première migration : `npx prisma migrate dev --name init`
- [ ] Créer `prisma/seed.ts` avec catégories par défaut
- [ ] Tester la connexion

### Étape 3 : Structure de base (2h)
- [ ] Créer `src/app.ts` (Express app)
- [ ] Créer `src/server.ts` (Server entry)
- [ ] Créer `src/config/database.ts` (Prisma client)
- [ ] Créer `src/config/env.ts` (Zod validation)
- [ ] Créer `src/utils/logger.ts` (Winston)
- [ ] Créer `src/middleware/errorHandler.ts`
- [ ] Créer route de health check : `GET /api/health`

### Étape 4 : Authentication (4h)
- [ ] `src/utils/jwt.ts`
- [ ] `src/utils/hash.ts`
- [ ] `src/validators/auth.validator.ts`
- [ ] `src/services/auth.service.ts`
- [ ] `src/controllers/auth.controller.ts`
- [ ] `src/routes/auth.routes.ts`
- [ ] `src/middleware/auth.ts` (requireAuth)
- [ ] Tester avec Postman/Thunder Client

### Étape 5 : Users & Settings (2h)
- [ ] `src/repositories/user.repository.ts`
- [ ] `src/services/settings.service.ts`
- [ ] `src/controllers/settings.controller.ts`
- [ ] `src/routes/settings.routes.ts`
- [ ] Tester GET /api/settings
- [ ] Tester PATCH /api/settings

### Étape 6 : Categories (2h)
- [ ] Seed catégories par défaut
- [ ] `src/repositories/category.repository.ts`
- [ ] `src/validators/category.validator.ts`
- [ ] `src/services/categories.service.ts`
- [ ] `src/controllers/categories.controller.ts`
- [ ] `src/routes/categories.routes.ts`
- [ ] Tester CRUD complet

### Étape 7 : Transactions (4h)
- [ ] `src/repositories/transaction.repository.ts`
- [ ] `src/validators/transaction.validator.ts`
- [ ] `src/services/transactions.service.ts`
- [ ] `src/controllers/transactions.controller.ts`
- [ ] `src/routes/transactions.routes.ts`
- [ ] Implémenter filtres (type, category, date range)
- [ ] Implémenter pagination
- [ ] Tester CRUD complet

### Étape 8 : Savings Goals (3h)
- [ ] `src/repositories/savings.repository.ts`
- [ ] `src/validators/savings.validator.ts`
- [ ] `src/services/savings.service.ts`
- [ ] `src/controllers/savings.controller.ts`
- [ ] `src/routes/savings.routes.ts`
- [ ] Implémenter deposits (lié aux transactions)
- [ ] Calculer currentAmount automatiquement
- [ ] Tester

### Étape 9 : Dashboard (2h)
- [ ] `src/services/dashboard.service.ts`
- [ ] `src/controllers/dashboard.controller.ts`
- [ ] `src/routes/dashboard.routes.ts`
- [ ] Calculer tous les totaux
- [ ] Récupérer recent transactions
- [ ] Récupérer savings goals
- [ ] Tester

### Étape 10 : Notifications (2h)
- [ ] `src/repositories/notification.repository.ts`
- [ ] `src/services/notifications.service.ts`
- [ ] `src/controllers/notifications.controller.ts`
- [ ] `src/routes/notifications.routes.ts`
- [ ] Système de génération automatique (à implémenter)
- [ ] Tester

### Étape 11 : Analytics (3h)
- [ ] `src/services/analytics.service.ts`
- [ ] `src/controllers/analytics.controller.ts`
- [ ] `src/routes/analytics.routes.ts`
- [ ] Calculer monthly data (revenus, dépenses, épargne)
- [ ] Calculer spending by category
- [ ] Calculer savings rate
- [ ] Tester

### Étape 12 : Security (PIN) (2h)
- [ ] Ajouter routes PIN dans settings
- [ ] Hasher le PIN avec bcrypt
- [ ] Vérifier le PIN
- [ ] Changer le PIN
- [ ] Tester

### Étape 13 : Tests & Polish (3h)
- [ ] Tester tous les endpoints
- [ ] Vérifier les permissions (user isolation)
- [ ] Vérifier la validation
- [ ] Vérifier les erreurs
- [ ] Logging propre
- [ ] Documentation API (Postman collection ou Swagger)

### Étape 14 : Préparation Render (1h)
- [ ] Vérifier `process.env.PORT`
- [ ] Configurer CORS production
- [ ] Configurer DATABASE_URL pour Supabase
- [ ] Créer `render.yaml` (optionnel)
- [ ] Tester build : `npm run build`
- [ ] Tester start : `npm start`

---

## TEMPS ESTIMÉ TOTAL : ~35 heures

---

## PHASE 8 : INTÉGRATION FRONTEND

### Étape 1 : Créer la couche API frontend
```
src/api/
├── client.ts
├── auth.ts
├── transactions.ts
├── categories.ts
├── savings.ts
├── dashboard.ts
├── notifications.ts
├── settings.ts
└── analytics.ts
```

### Étape 2 : Adapter WealthContext
- Remplacer localStorage par API calls
- Gérer loading states
- Gérer error states
- Conserver tokens en localStorage

### Étape 3 : Tests intégration
- Tester login/register
- Tester chaque module
- Vérifier synchronisation

---

## NOTES IMPORTANTES

### Sécurité
- ✅ JWT avec refresh tokens
- ✅ bcrypt pour passwords
- ✅ bcrypt pour PIN
- ✅ Helmet pour headers HTTP
- ✅ CORS configuré
- ✅ Rate limiting
- ✅ Validation Zod
- ✅ Isolation par userId

### Performance
- Index sur colonnes fréquentes (userId, date, categoryId)
- Pagination sur listes longues
- Cache éventuel (Redis) si nécessaire

### Monitoring
- Winston pour logs
- Health check endpoint
- Error tracking (Sentry optionnel)

---

**Document généré par Kiro AI**
**Projet** : WealthFlow V2 Backend
**Date** : 8 septembre 2026
