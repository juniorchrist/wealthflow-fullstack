# ANALYSE COMPLÈTE DU FRONTEND WEALTHFLOW V2
## Document de synthèse pour la construction du nouveau backend

Date de l'analyse : 8 septembre 2026
Analysé par : Kiro AI Assistant

---

## 1. RÉSUMÉ EXÉCUTIF

Le frontend WealthFlow V2 est une application React complète de gestion financière personnelle, actuellement opérationnelle avec des données stockées en **localStorage** via `initialData.ts`. 

**Objectif** : Construire un backend Node.js + Express + TypeScript + Prisma + PostgreSQL (Supabase) pour remplacer le système de persistance local par une vraie API REST.

---

## 2. ARCHITECTURE FRONTEND ACTUELLE

### 2.1 Stack technologique
- **Framework** : React 19.0.1
- **Build** : Vite 6.2.3
- **Langage** : TypeScript 5.8.2
- **Styling** : Tailwind CSS 4.1.14
- **Icons** : Lucide React
- **Animations** : Motion

### 2.2 Structure des dossiers
```
src/
├── App.tsx                    # Point d'entrée principal
├── main.tsx                   # Bootstrap React
├── types.ts                   # Tous les types TypeScript
├── index.css                  # Styles globaux
├── context/
│   └── WealthContext.tsx      # État global de l'application
├── data/
│   └── initialData.ts         # Données fictives actuelles
├── components/
│   ├── admin/                 # Administration (peu utilisé)
│   ├── analytics/             # Graphiques et statistiques
│   ├── auth/                  # Connexion/Inscription
│   ├── budget/                # Gestion du budget
│   ├── categories/            # Gestion des catégories
│   ├── common/                # Composants réutilisables
│   ├── dashboard/             # Dashboard principal
│   ├── landing/               # Page d'accueil publique
│   ├── layout/                # Layouts (AppShell, etc.)
│   ├── modals/                # Modals (NewTransaction, NewGoal, etc.)
│   ├── notifications/         # Centre de notifications
│   ├── savings/               # Objectifs d'épargne
│   ├── security/              # Verrouillage par PIN
│   ├── settings/              # Paramètres utilisateur
│   ├── strategy/              # Recommandations financières
│   └── transactions/          # Liste des transactions
```

---

## 3. MODÈLE DE DONNÉES ACTUEL (types.ts)

### 3.1 Transaction
```typescript
export type TransactionType = 'income' | 'expense' | 'savings_deposit';

export interface Transaction {
  id: string;                 // Généré côté client : "tx-{timestamp}"
  title: string;              // Description
  category: string;           // Nom de la catégorie (redondant avec categoryId)
  categoryId: string;         // Référence à Category.id
  amount: number;             // Montant en FCFA
  type: TransactionType;      // Type de transaction
  account: string;            // Nom du compte (non structuré)
  date: string;               // Format YYYY-MM-DD
  time?: string;              // Format HH:MM
  notes?: string;             // Notes optionnelles
}
```

**IMPORTANT** : 
- `category` (string) est redondant avec `categoryId`
- `account` est actuellement une chaîne libre, pas une relation

### 3.2 Category
```typescript
export interface Category {
  id: string;                 // "cat-1", "cat-2", etc.
  name: string;               // Nom affiché
  icon: string;               // Nom de l'icône Lucide
  color: string;              // Code couleur hex
  budgetLimit: number;        // Limite de budget pour cette catégorie
  type: 'expense' | 'income'; // Type de catégorie
}
```

**OBSERVATION** :
- Les catégories d'**expense** ont un `budgetLimit` utilisé
- Les catégories d'**income** ont `budgetLimit: 0`

### 3.3 SavingsGoal
```typescript
export interface SavingsGoal {
  id: string;                    // "goal-{timestamp}"
  title: string;                 // Nom de l'objectif
  targetAmount: number;          // Montant cible
  currentAmount: number;         // Montant actuel épargné
  deadline: string;              // Ex: "Décembre 2026" (format libre)
  icon: string;                  // Nom de l'icône Lucide
  color: string;                 // Code couleur hex
  description?: string;          // Description optionnelle
  isAutoSaveActive?: boolean;    // Épargne automatique activée
  autoSaveAmount?: number;       // Montant de l'épargne auto
  checkboxesCount?: number;      // Nombre de cases de progression
  checkedBoxes?: number[];       // Indices des cases cochées
}
```

**OBSERVATION CRITIQUE** :
- Le système de **checkboxes** est une représentation visuelle
- `currentAmount` devrait être la **source de vérité**, pas les cases
- Les **versements** (deposits) ne sont PAS stockés séparément actuellement
- Un versement crée une transaction de type `savings_deposit`

### 3.4 MonthlyBudget
```typescript
export interface MonthlyBudget {
  month: string;                           // Format "2026-09"
  totalBudget: number;                     // Budget total du mois
  categoryBudgets: Record<string, number>; // categoryId -> limite
}
```

**OBSERVATION** :
- Ce type existe dans `types.ts` mais n'est **PAS utilisé** dans le contexte actuel
- Le budget mensuel est calculé dynamiquement à partir des `budgetLimit` des catégories

### 3.5 NotificationItem
```typescript
export interface NotificationItem {
  id: string;                              // "notif-{id}"
  title: string;                           // Titre
  message: string;                         // Message
  date: string;                            // Date au format libre
  read: boolean;                           // Lu ou non
  type: 'info' | 'warning' | 'success' | 'alert';
}
```

### 3.6 UserProfile
```typescript
export interface UserProfile {
  name: string;                  // Nom complet
  email: string;                 // Email
  phone: string;                 // Téléphone
  avatar?: string;               // URL de l'avatar
  currency: string;              // "FCFA"
  language: string;              // "Français"
  timezone: string;              // "GMT +00:00"
  dateFormat: string;            // "DD/MM/YYYY"
  plan: string;                  // "WealthFlow Pro"
  pinCode: string;               // Code PIN (4 chiffres)
  isPinEnabled: boolean;         // PIN activé ou non
  isLocked: boolean;             // État de verrouillage actuel
  autoLockMinutes: number;       // Délai avant verrouillage auto
}
```

**SÉCURITÉ** :
- Le `pinCode` est stocké **en clair** dans localStorage actuellement
- Le backend doit le hasher (bcrypt/Argon2)

---

## 4. FONCTIONNALITÉS IDENTIFIÉES

### 4.1 Authentification
**Fichiers** : `src/components/auth/AuthModal.tsx`, `WealthContext.tsx`

**Flux actuel** :
1. **Login** : Accepte n'importe quels identifiants (mode démo)
2. **Register** : Crée un profil avec nom, email, currency
3. **Session** : Stockée dans `localStorage` sous `wf_session_active_v2`

**API nécessaire** :
```
POST /api/auth/register
  Body: { name, email, password, currency }
  Response: { user, tokens: { accessToken, refreshToken } }

POST /api/auth/login
  Body: { email, password }
  Response: { user, tokens: { accessToken, refreshToken } }

GET /api/auth/me
  Headers: Authorization: Bearer {token}
  Response: { user }

POST /api/auth/logout
  Body: { refreshToken }
  Response: { success: true }

POST /api/auth/refresh
  Body: { refreshToken }
  Response: { accessToken }
```

### 4.2 Transactions
**Fichiers** : `TransactionsView.tsx`, `NewTransactionModal.tsx`

**Opérations CRUD** :
- **Créer** : via modal avec type, montant, catégorie, date, notes
- **Lire** : affichage liste, recherche, filtres (type, catégorie, période)
- **Modifier** : édition inline (à implémenter côté frontend)
- **Supprimer** : suppression avec confirmation

**Calculs côté frontend actuels** :
- `totalIncome` = somme des transactions type 'income'
- `totalExpenses` = somme des transactions type 'expense'
- `totalBalance` = **startingAnchor (1520000)** + totalIncome - totalExpenses

**⚠️ PROBLÈME IDENTIFIÉ** :
- La valeur `startingAnchor = 1520000` est **hardcodée**
- Le backend doit gérer un **solde initial** par compte ou calculer le solde à partir d'un historique complet

**API nécessaire** :
```
GET /api/transactions
  Query: ?page=1&limit=20&type=expense&categoryId=cat-1&startDate=2026-09-01&endDate=2026-09-30
  Response: { transactions: [], pagination: { total, page, pages } }

POST /api/transactions
  Body: { title, amount, type, categoryId, accountId?, date, time?, notes? }
  Response: { transaction }

GET /api/transactions/:id
  Response: { transaction }

PATCH /api/transactions/:id
  Body: { title?, amount?, categoryId?, ... }
  Response: { transaction }

DELETE /api/transactions/:id
  Response: { success: true }
```

### 4.3 Catégories
**Fichiers** : `CategoriesView.tsx`, `NewCategoryModal.tsx`

**Fonctionnalités** :
- Catégories prédéfinies (avec `isDefault: true`)
- Catégories personnalisées (créées par l'utilisateur)
- Type : `expense` ou `income`
- Budget limite par catégorie

**API nécessaire** :
```
GET /api/categories
  Response: { categories: [] }

POST /api/categories
  Body: { name, icon, color, budgetLimit, type }
  Response: { category }

PATCH /api/categories/:id
  Body: { name?, icon?, color?, budgetLimit? }
  Response: { category }

DELETE /api/categories/:id
  Response: { success: true }
```

### 4.4 Budget
**Fichiers** : `BudgetView.tsx`

**Calcul actuel** :
```javascript
const monthlyBudgetTotal = categories
  .filter((c) => c.type === 'expense')
  .reduce((acc, curr) => acc + curr.budgetLimit, 0);

const monthlyBudgetSpent = totalExpenses;
const monthlyBudgetRemaining = monthlyBudgetTotal - monthlyBudgetSpent;
```

**Besoins** :
- Budget mensuel global
- Budget par catégorie
- Progression en temps réel
- Alertes quand budget dépassé

**Modèle backend suggéré** :
- Un `Budget` par mois avec des `BudgetCategory` liées
- Ou calculer dynamiquement à partir des catégories + transactions

**API nécessaire** :
```
GET /api/budgets/current
  Response: { 
    month: "2026-09",
    totalBudget, 
    totalSpent, 
    remaining, 
    percentage,
    categories: [{ categoryId, name, limit, spent, remaining, percentage }]
  }

PATCH /api/budgets/current/categories
  Body: { updates: [{ categoryId, budgetLimit }] }
  Response: { budget }
```

### 4.5 Objectifs d'épargne
**Fichiers** : `SavingsView.tsx`, `NewGoalModal.tsx`

**Fonctionnalités** :
- Créer un objectif (titre, montant cible, deadline, icon, color)
- Versement manuel (contributeToGoal)
- Auto-épargne (toggle)
- Progression visuelle avec checkboxes
- Calcul : `progress = (currentAmount / targetAmount) * 100`

**⚠️ CRITIQUE** :
- Les **versements** ne sont PAS stockés séparément
- `currentAmount` est mis à jour directement
- Une transaction `savings_deposit` est créée mais sans lien explicite vers le goal

**Modèle backend suggéré** :
```
SavingsGoal (id, userId, title, targetAmount, currentAmount, deadline, ...)
SavingsDeposit (id, goalId, amount, date, transactionId?)
```

**API nécessaire** :
```
GET /api/savings-goals
  Response: { goals: [] }

POST /api/savings-goals
  Body: { title, targetAmount, deadline, icon, color, description? }
  Response: { goal }

PATCH /api/savings-goals/:id
  Body: { title?, targetAmount?, ... }
  Response: { goal }

DELETE /api/savings-goals/:id
  Response: { success: true }

POST /api/savings-goals/:id/deposits
  Body: { amount, date?, notes? }
  Response: { deposit, goal }

GET /api/savings-goals/:id/deposits
  Response: { deposits: [] }
```

### 4.6 Dashboard
**Fichiers** : `DashboardView.tsx`

**Données affichées** :
- Solde disponible
- Revenus totaux
- Dépenses totales
- Moyenne quotidienne de dépenses
- Budget mensuel (total, dépensé, restant, %)
- Objectifs d'épargne (2 premiers)
- Activité récente (5 dernières transactions)
- Notifications non lues (compteur)

**API nécessaire** :
```
GET /api/dashboard/summary
  Response: {
    balance,
    totalIncome,
    totalExpenses,
    totalSaved,
    monthlyBudget: { total, spent, remaining, percentage },
    recentTransactions: [...],
    savingsGoals: [...],
    unreadNotificationsCount
  }
```

### 4.7 Notifications
**Fichiers** : `NotificationsView.tsx`

**Types de notifications** :
- `info` : Informations générales
- `warning` : Alertes budget
- `success` : Objectifs atteints
- `alert` : Dépassement budget

**API nécessaire** :
```
GET /api/notifications
  Query: ?unreadOnly=true
  Response: { notifications: [] }

PATCH /api/notifications/:id/read
  Response: { notification }

PATCH /api/notifications/read-all
  Response: { count }

DELETE /api/notifications/:id
  Response: { success: true }
```

### 4.8 Sécurité (PIN)
**Fichiers** : `LockScreen.tsx`, `SecurityView.tsx`

**Fonctionnalités** :
- Code PIN à 4 chiffres
- Verrouillage manuel
- Verrouillage automatique après X minutes
- Réinitialisation du PIN

**⚠️ SÉCURITÉ** :
- Le PIN est stocké en **clair** actuellement
- Le backend doit le **hasher**
- Ne jamais exposer le PIN hashé au frontend

**API nécessaire** :
```
POST /api/security/pin/set
  Body: { pin }
  Response: { success: true }

POST /api/security/pin/verify
  Body: { pin }
  Response: { valid: boolean }

POST /api/security/pin/change
  Body: { oldPin, newPin }
  Response: { success: true }
```

### 4.9 Settings
**Fichiers** : `SettingsView.tsx`

**Paramètres modifiables** :
- Profil : nom, email, téléphone, avatar
- Préférences : currency, language, timezone, dateFormat
- Sécurité : PIN, autoLock
- Plan : affichage uniquement

**API nécessaire** :
```
GET /api/settings
  Response: { settings: { ...userProfile } }

PATCH /api/settings
  Body: { name?, email?, phone?, currency?, ... }
  Response: { settings }
```

### 4.10 Analytics
**Fichiers** : `AnalyticsView.tsx`

**Graphiques affichés** :
- Évolution mensuelle (revenus, dépenses, épargne)
- Répartition par catégorie
- Taux d'épargne
- Comparaisons mensuelles

**Données hardcodées actuellement** : `initialChartData`

**API nécessaire** :
```
GET /api/analytics/monthly
  Query: ?months=6
  Response: { data: [{ month, income, expenses, savings }] }

GET /api/analytics/categories
  Query: ?startDate=2026-09-01&endDate=2026-09-30
  Response: { categories: [{ categoryId, name, amount, percentage }] }

GET /api/analytics/savings-rate
  Response: { rate: 38, trend: "+5%" }
```

---

## 5. DONNÉES ACTUELLEMENT HARDCODÉES

### 5.1 initialData.ts

**Données à remplacer par l'API** :
- ✅ `initialUserProfile` → GET /api/auth/me
- ✅ `initialCategories` → GET /api/categories (avec isDefault)
- ✅ `initialTransactions` → GET /api/transactions
- ✅ `initialSavingsGoals` → GET /api/savings-goals
- ✅ `initialNotifications` → GET /api/notifications
- ✅ `initialChartData` → GET /api/analytics/monthly

### 5.2 Valeurs hardcodées dans le contexte

```javascript
// PROBLÈME : Solde initial hardcodé
const startingAnchor = 1520000;
const totalBalance = startingAnchor + totalIncome - totalExpenses;

// PROBLÈME : Taux d'épargne avec fallback arbitraire
const savingsRate = totalIncome > 0 
  ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) 
  : 38; // ← Pourquoi 38% ?

// PROBLÈME : Compte par défaut non structuré
account: 'Compte principal'
```

---

## 6. RELATIONS ENTRE ENTITÉS

### 6.1 Schéma relationnel identifié

```
User (1) ──→ (N) Transaction
User (1) ──→ (N) SavingsGoal
User (1) ──→ (N) Notification
User (1) ──→ (N) Category (personnalisées)
User (1) ──→ (1) UserSettings
User (1) ──→ (N) Account (optionnel)

Transaction (N) ──→ (1) Category
Transaction (N) ──→ (1) Account (optionnel)

SavingsGoal (1) ──→ (N) SavingsDeposit
SavingsDeposit (1) ──→ (1) Transaction (optionnel)

Budget (1) ──→ (N) BudgetCategory
BudgetCategory (N) ──→ (1) Category
```

---

## 7. STORAGE ACTUEL (localStorage)

**Clés utilisées** :
```javascript
const STORAGE_KEYS = {
  USER: 'wf_user_profile_v2',
  TRANSACTIONS: 'wf_transactions_v2',
  GOALS: 'wf_savings_goals_v2',
  CATEGORIES: 'wf_categories_v2',
  NOTIFICATIONS: 'wf_notifications_v2',
  SESSION: 'wf_session_active_v2',
  LAST_TAB: 'wf_last_active_tab_v2',
};
```

**Ce qui doit rester en localStorage** :
- Session token (accessToken, refreshToken)
- Préférences UI (last tab, theme, etc.)
- Cache temporaire (optionnel)

**Ce qui doit être supprimé** :
- Toutes les données métier (transactions, goals, etc.)
- User profile complet (sauf cache)

---

## 8. CALCULS FINANCIERS ACTUELS

### 8.1 Côté frontend (à conserver ou déléguer au backend)

```javascript
// Totaux
totalIncome = sum(transactions where type='income')
totalExpenses = sum(transactions where type='expense')
totalSaved = sum(savingsGoals.currentAmount)

// Balance (PROBLÈME)
totalBalance = 1520000 + totalIncome - totalExpenses

// Budget
monthlyBudgetTotal = sum(categories where type='expense' → budgetLimit)
monthlyBudgetSpent = totalExpenses
monthlyBudgetRemaining = monthlyBudgetTotal - monthlyBudgetSpent
budgetPercentage = (monthlyBudgetSpent / monthlyBudgetTotal) * 100

// Épargne
goalProgress = (currentAmount / targetAmount) * 100
goalRemaining = targetAmount - currentAmount

// Analytics
dailyAverageExpense = totalExpenses / 30
savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100
```

---

## 9. POINTS CRITIQUES IDENTIFIÉS

### 9.1 Solde initial (startingAnchor)
❌ **Problème** : La valeur `1520000` est hardcodée
✅ **Solution** : 
- Option 1 : Ajouter un champ `initialBalance` dans Account
- Option 2 : Calculer le solde à partir de TOUTES les transactions historiques
- Option 3 : Ajouter une transaction initiale de type `initial_balance`

### 9.2 Compte (account)
❌ **Problème** : `account` est une chaîne libre ("Compte principal", "Carte bancaire")
✅ **Solution** : Créer un modèle `Account` avec relation vers Transaction

### 9.3 Catégories
❌ **Problème** : `category` (string) est redondant avec `categoryId`
✅ **Solution** : Supprimer le champ `category` de Transaction, utiliser uniquement `categoryId`

### 9.4 Versements d'épargne
❌ **Problème** : Les versements ne sont pas stockés séparément
✅ **Solution** : Créer un modèle `SavingsDeposit` avec relation vers SavingsGoal et Transaction

### 9.5 Budget mensuel
❌ **Problème** : Le budget est calculé dynamiquement sans historique
✅ **Solution** : 
- Option 1 : Garder le calcul dynamique
- Option 2 : Créer un modèle `Budget` pour historiser

### 9.6 Notifications automatiques
❌ **Problème** : Les notifications sont hardcodées
✅ **Solution** : Le backend doit générer des notifications automatiques :
- Budget dépassé
- Objectif atteint
- Épargne recommandée
- Transactions inhabituelles

### 9.7 PIN de sécurité
❌ **Problème** : Le PIN est stocké en clair
✅ **Solution** : Hasher avec bcrypt/Argon2 côté backend

---

## 10. MODÈLE PRISMA SUGGÉRÉ

```prisma
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
  
  @@index([email])
}

model Account {
  id             String        @id @default(cuid())
  userId         String
  name           String
  type           String        // "main", "card", "cash", "savings"
  initialBalance Float         @default(0)
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
  currentAmount     Float            @default(0)
  deadline          String
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

## 11. ROUTES API À IMPLÉMENTER

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`

### Transactions
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/transactions/:id`
- `PATCH /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Categories
- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`

### Savings Goals
- `GET /api/savings-goals`
- `POST /api/savings-goals`
- `GET /api/savings-goals/:id`
- `PATCH /api/savings-goals/:id`
- `DELETE /api/savings-goals/:id`
- `POST /api/savings-goals/:id/deposits`
- `GET /api/savings-goals/:id/deposits`

### Budget
- `GET /api/budgets/current`
- `PATCH /api/budgets/current/categories`

### Dashboard
- `GET /api/dashboard/summary`

### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`
- `DELETE /api/notifications/:id`

### Settings
- `GET /api/settings`
- `PATCH /api/settings`

### Security
- `POST /api/security/pin/set`
- `POST /api/security/pin/verify`
- `POST /api/security/pin/change`

### Analytics
- `GET /api/analytics/monthly`
- `GET /api/analytics/categories`
- `GET /api/analytics/savings-rate`

---

## 12. MIGRATION FRONTEND

### Phase 1 : Couche API
Créer `src/api/` avec :
- `client.ts` : Configuration Axios/Fetch
- `auth.ts` : Appels auth
- `transactions.ts` : Appels transactions
- `categories.ts` : Appels catégories
- `savings.ts` : Appels objectifs
- `dashboard.ts` : Appels dashboard
- `notifications.ts` : Appels notifications
- `settings.ts` : Appels settings
- `analytics.ts` : Appels analytics

### Phase 2 : Adaptation du contexte
Modifier `WealthContext.tsx` pour :
- Remplacer localStorage par appels API
- Gérer les états loading/error
- Conserver uniquement le cache UI en localStorage

### Phase 3 : Variables d'environnement
```env
VITE_API_URL=http://localhost:5000
```

---

## 13. CONCLUSION

✅ **Frontend analysé complètement**
✅ **Tous les besoins identifiés**
✅ **Modèle de données défini**
✅ **Routes API listées**
✅ **Points critiques relevés**

**PRÊT POUR LA PHASE 2** : Définition des entités et relations

---

**Document généré automatiquement par Kiro AI**
**Projet** : WealthFlow V2 Backend
**Date** : 8 septembre 2026
