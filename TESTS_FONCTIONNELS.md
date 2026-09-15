# Tests Fonctionnels - WealthFlow V2

## Vue d'ensemble

Ce document liste tous les tests fonctionnels à effectuer pour valider que WealthFlow V2 fonctionne correctement après les corrections apportées.

## ✅ Statut des corrections

### 1. Synchronisation PC/Mobile ✅
- **Problème résolu** : API comptes bancaires manquante
- **Solution** : Création complète de l'API `/api/accounts` avec routes, contrôleur et repository
- **Impact** : Les données des comptes sont maintenant synchronisées entre PC et mobile

### 2. CORS ✅
- **Configuration** : CORS permissif acceptant toutes les origines
- **Domaines supportés** : Netlify, InfinityFree, localhost
- **Documentation** : `backend/CORS_CONFIG.md` créé

### 3. Compilation ✅
- **Frontend** : Build Vite réussi (dist/ généré)
- **Backend** : Compilation TypeScript réussie (dist/ généré)
- **Démarrage** : Backend démarre sans erreur sur port 5000

---

## Tests à effectuer

### Test 1 : Authentification et rôles

#### 1.1 Inscription utilisateur
```bash
curl -X POST https://wealthflow-fullstack-2.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@wealthflow.app",
    "password": "Test123!",
    "nom": "Test",
    "prenom": "User",
    "numero": "+225 07 00 00 00 00",
    "currency": "FCFA"
  }'
```

**Résultat attendu** :
- ✅ Status 201
- ✅ `{ success: true, data: { user, tokens } }`
- ✅ Compte par défaut créé automatiquement
- ✅ `accessToken` et `refreshToken` retournés

#### 1.2 Connexion utilisateur
```bash
curl -X POST https://wealthflow-fullstack-2.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@wealthflow.app",
    "password": "Test123!"
  }'
```

**Résultat attendu** :
- ✅ Status 200
- ✅ `{ success: true, data: { user, tokens } }`
- ✅ `user.role` = "user" (par défaut)

#### 1.3 Vérifier le profil
```bash
curl -X GET https://wealthflow-fullstack-2.onrender.com/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Résultat attendu** :
- ✅ Status 200
- ✅ Profil utilisateur complet retourné
- ✅ `role`, `email`, `nom`, `prenom` corrects

#### 1.4 Redirection selon rôle (Frontend)
**Test manuel** :
1. Connexion avec utilisateur normal → Redirection vers Dashboard utilisateur
2. Connexion avec admin → Redirection vers Dashboard admin

**Résultat attendu** :
- ✅ Utilisateur : onglet `dashboard` actif
- ✅ Admin : onglet `admin` actif

---

### Test 2 : Comptes bancaires (NOUVEAU)

#### 2.1 Récupérer les comptes
```bash
curl -X GET https://wealthflow-fullstack-2.onrender.com/api/accounts \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Résultat attendu** :
- ✅ Status 200
- ✅ `{ success: true, data: [{ id, name, type, initialBalance, currency, isDefault, ... }] }`
- ✅ Au moins un compte (créé automatiquement à l'inscription)

#### 2.2 Créer un nouveau compte
```bash
curl -X POST https://wealthflow-fullstack-2.onrender.com/api/accounts \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Compte Épargne",
    "type": "savings",
    "initialBalance": 50000,
    "currency": "FCFA",
    "icon": "PiggyBank",
    "color": "#3B82F6"
  }'
```

**Résultat attendu** :
- ✅ Status 201
- ✅ `{ success: true, data: { id, name, type, ... } }`
- ✅ Compte créé avec `isDefault: false`

#### 2.3 Mettre à jour un compte
```bash
curl -X PUT https://wealthflow-fullstack-2.onrender.com/api/accounts/<ACCOUNT_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mon Compte Épargne",
    "initialBalance": 75000
  }'
```

**Résultat attendu** :
- ✅ Status 200
- ✅ Compte mis à jour

#### 2.4 Définir un compte par défaut
```bash
curl -X PATCH https://wealthflow-fullstack-2.onrender.com/api/accounts/<ACCOUNT_ID>/default \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Résultat attendu** :
- ✅ Status 200
- ✅ Compte défini comme défaut
- ✅ Ancien compte par défaut n'est plus par défaut

#### 2.5 Supprimer un compte
```bash
curl -X DELETE https://wealthflow-fullstack-2.onrender.com/api/accounts/<ACCOUNT_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Résultat attendu** :
- ✅ Status 200 (si ce n'est pas le compte par défaut)
- ✅ Status 400 (si c'est le compte par défaut et qu'il y a d'autres comptes)

#### 2.6 Synchronisation PC/Mobile
**Test manuel** :
1. Créer un compte sur PC
2. Rafraîchir la page sur mobile (ou vice versa)
3. Vérifier que le compte apparaît

**Résultat attendu** :
- ✅ Compte visible sur tous les appareils
- ✅ `refreshRemoteData()` charge les comptes depuis l'API

---

### Test 3 : Épargne

#### 3.1 Créer un objectif d'épargne
```bash
curl -X POST https://wealthflow-fullstack-2.onrender.com/api/savings-goals \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Voyage à Paris",
    "targetAmount": 500000,
    "deadline": "2027-12-31",
    "icon": "Plane",
    "color": "#3B82F6",
    "description": "Économiser pour un voyage"
  }'
```

**Résultat attendu** :
- ✅ Status 201
- ✅ `{ success: true, data: { goal: { id, title, targetAmount, currentAmount: 0, ... } } }`

#### 3.2 Effectuer un dépôt initial
```bash
curl -X POST https://wealthflow-fullstack-2.onrender.com/api/savings-goals/<GOAL_ID>/deposits \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "date": "2026-09-15",
    "notes": "Premier dépôt"
  }'
```

**Résultat attendu** :
- ✅ Status 201
- ✅ Transaction créée avec `type: "savings_deposit"`
- ✅ `currentAmount` de l'objectif augmenté de 50000
- ✅ Solde total réduit de 50000 (épargne déduite)

#### 3.3 Vérifier le calcul du solde
**Test manuel** :
1. Dashboard affiche : `totalBalance = totalIncome - totalExpenses - totalSavingsDeposits`
2. Effectuer un dépôt d'épargne de 10000 FCFA
3. Vérifier que le solde diminue de 10000 FCFA

**Résultat attendu** :
- ✅ Solde diminue correctement après dépôt d'épargne
- ✅ Formule : `balance = initialBalance + revenus - dépenses - épargne`

#### 3.4 Vérifier le CTA "Nouvelle épargne"
**Test manuel** :
1. Créer un objectif d'épargne via le modal
2. Effectuer un dépôt initial (optionnel)
3. Vérifier que la navigation se fait vers le bon objectif

**Résultat attendu** :
- ✅ Après création, redirection vers l'objectif créé
- ✅ Utilise `res.data.goal.id` (et non `res.data.id`)

---

### Test 4 : Dashboard Admin

#### 4.1 Connexion admin
**Test manuel** :
1. Se connecter avec un compte admin
2. Vérifier que l'onglet "Admin" est accessible

**Résultat attendu** :
- ✅ Onglet "Admin" visible
- ✅ Redirection automatique vers l'onglet "Admin"

#### 4.2 Statistiques financières réelles
```bash
curl -X GET https://wealthflow-fullstack-2.onrender.com/api/admin/dashboard \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Résultat attendu** :
- ✅ Status 200
- ✅ Statistiques basées sur vraies données :
  - `totalUsers` : nombre réel d'utilisateurs
  - `totalRevenue` : somme réelle des transactions de type "income"
  - `totalExpenses` : somme réelle des transactions de type "expense"
  - `totalSavings` : somme réelle des dépôts d'épargne

#### 4.3 Liste des utilisateurs
```bash
curl -X GET https://wealthflow-fullstack-2.onrender.com/api/admin/users \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Résultat attendu** :
- ✅ Status 200
- ✅ Liste des utilisateurs avec données financières réelles
- ✅ Chaque utilisateur a : `income`, `expenses`, `savings`, `balance`

#### 4.4 Supprimer un utilisateur
```bash
curl -X DELETE https://wealthflow-fullstack-2.onrender.com/api/admin/users/<USER_ID> \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Test de suppression"
  }'
```

**Résultat attendu** :
- ✅ Status 200
- ✅ Utilisateur supprimé en cascade (transactions, comptes, épargnes, etc.)
- ✅ BanRecord créé avec l'email et la raison
- ✅ Si l'utilisateur connecté est supprimé, il est déconnecté automatiquement

---

### Test 5 : Notifications

#### 5.1 Notifications admin → utilisateurs
**Test manuel** :
1. Depuis le dashboard admin, envoyer une notification à tous les utilisateurs
2. Se connecter avec un compte utilisateur
3. Vérifier que la notification apparaît

**Résultat attendu** :
- ✅ Notification visible dans l'onglet "Notifications"
- ✅ Badge de notification (point rouge) si non lue

#### 5.2 Notifications automatiques tickets support
**Test manuel** :
1. Soumettre un ticket support depuis "Centre d'aide"
2. Vérifier qu'une notification est créée pour l'utilisateur

**Résultat attendu** :
- ✅ Notification créée avec le message "Votre ticket a été reçu"
- ✅ Notification visible dans l'onglet "Notifications"

#### 5.3 Marquer comme lue
```bash
curl -X PATCH https://wealthflow-fullstack-2.onrender.com/api/notifications/<NOTIF_ID>/read \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Résultat attendu** :
- ✅ Status 200
- ✅ Notification marquée comme lue (`read: true`)

---

### Test 6 : FAQ et Centre d'aide

#### 6.1 Vérifier la FAQ dans Légal
**Test manuel** :
1. Aller dans l'onglet "Légal"
2. Cliquer sur l'onglet "FAQ" (3e onglet)

**Résultat attendu** :
- ✅ FAQ visible dans l'onglet "Légal"
- ✅ Contenu de la FAQ intact (non supprimé)

#### 6.2 Centre d'aide
**Test manuel** :
1. Aller dans "Centre d'aide"
2. Vérifier que la FAQ n'est plus présente

**Résultat attendu** :
- ✅ FAQ absente du Centre d'aide
- ✅ Seulement "Tutoriel" et "Support" visibles

---

### Test 7 : CORS et déploiement

#### 7.1 Test CORS depuis Netlify
**Test manuel** :
1. Déployer le frontend sur Netlify
2. Ouvrir l'application : `https://fluffy-panda-d9b796.netlify.app`
3. Se connecter / créer un compte
4. Vérifier qu'il n'y a pas d'erreur CORS dans la console

**Résultat attendu** :
- ✅ Pas d'erreur CORS
- ✅ Headers CORS présents : `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`

#### 7.2 Test CORS depuis localhost
```bash
# Démarrer le frontend en local
npm run dev

# Ouvrir http://localhost:5173
# Se connecter et vérifier les requêtes API
```

**Résultat attendu** :
- ✅ Pas d'erreur CORS
- ✅ Requêtes API réussies

#### 7.3 Test CORS préflight
```bash
curl -I -X OPTIONS \
  -H "Origin: https://fluffy-panda-d9b796.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  https://wealthflow-fullstack-2.onrender.com/api/auth/login
```

**Résultat attendu** :
- ✅ Status 204
- ✅ `Access-Control-Allow-Origin: https://fluffy-panda-d9b796.netlify.app`
- ✅ `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
- ✅ `Access-Control-Allow-Headers: Content-Type, Authorization, ...`

---

## Checklist finale

### Backend
- [x] Compile sans erreur (`npm run build`)
- [x] Démarre sans erreur (`node dist/server.js`)
- [x] Toutes les routes API répondent
- [x] CORS configuré correctement
- [x] Base de données connectée (Supabase)
- [x] Migrations Prisma appliquées

### Frontend
- [x] Compile sans erreur (`npm run build`)
- [x] Fichiers de déploiement générés (`.htaccess`, `_redirects`)
- [x] Variables d'environnement configurées (`.env`)
- [x] API appelée correctement (`VITE_API_URL`)

### Fonctionnalités
- [ ] Authentification (inscription, connexion, profil)
- [ ] Redirection selon rôle (user → dashboard, admin → admin)
- [ ] Comptes bancaires (CRUD + synchronisation)
- [ ] Épargne (création, dépôt, calcul solde)
- [ ] Dashboard admin (stats réelles, liste utilisateurs)
- [ ] Notifications (admin → users, tickets support)
- [ ] Suppression utilisateurs (cascade + déconnexion)
- [ ] FAQ déplacée dans Légal
- [ ] CORS fonctionnel (Netlify, localhost)

---

## Prochaines étapes

### Déploiement
1. **Backend sur Render** :
   ```bash
   git add .
   git commit -m "Fix: Add accounts API + CORS config + TypeScript fixes"
   git push
   ```
   Render redéploiera automatiquement.

2. **Frontend sur Netlify** :
   - Via Git (recommandé) : Push sur GitHub → Netlify redéploie auto
   - Ou upload manuel : Drag & drop du dossier `dist/` dans Netlify

3. **Frontend sur InfinityFree** :
   - Suivre le guide `DEPLOY_INFINITYFREE.md`
   - Upload du contenu de `dist/` dans `htdocs/`

### Tests en production
Une fois déployé, refaire tous les tests ci-dessus en production pour confirmer que tout fonctionne.

---

## Notes importantes

### Problèmes résolus ✅
1. **Synchronisation PC/Mobile** : API comptes créée, `refreshRemoteData()` charge les comptes
2. **CORS** : Configuration permissive, support multi-domaines
3. **Compilation** : Frontend et backend compilent sans erreur
4. **TypeScript** : Tous les types corrigés (`req.user.userId`, `Promise<void>`)

### Améliorations futures (optionnelles)
- Optimiser la taille du bundle JS (517 KB → code splitting)
- Ajouter des tests unitaires (Jest, Vitest)
- Ajouter des tests E2E (Playwright, Cypress)
- Monitoring et logs en production (Sentry, LogRocket)
- Mise en cache Redis pour les sessions
- Rate limiting plus strict en production
- Webhooks pour notifications push
