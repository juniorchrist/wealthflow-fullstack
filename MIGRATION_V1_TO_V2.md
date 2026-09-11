# 🔄 MIGRATION V1 → V2 SUR RENDER EXISTANT

**Service** : wealthflow-fullstack-2.onrender.com  
**Objectif** : Remplacer le backend V1 par le backend V2 sans créer un nouveau service

---

## ✅ AVANTAGES DE CETTE APPROCHE

1. ✅ **Réutilise** la configuration existante (variables d'environnement, DB)
2. ✅ **Conserve** l'URL actuelle (pas de changement côté frontend)
3. ✅ **Économise** un service Render (plan gratuit limité)
4. ✅ **Plus simple** que de tout reconfigurer

---

## 📋 PRÉREQUIS

### Informations nécessaires (depuis Render Dashboard) :

- [ ] Repository GitHub connecté
- [ ] Branche utilisée
- [ ] Root Directory (si configuré)
- [ ] Variables d'environnement actuelles

---

## 🎯 PLAN D'EXÉCUTION

### ÉTAPE 1 : Backup du backend V1 (sécurité)

Avant de remplacer, on crée une branche backup :

```bash
cd /chemin/vers/repo/existant
git checkout -b backup-v1
git push origin backup-v1
```

### ÉTAPE 2 : Copier le backend V2

Deux options :

#### Option A : Remplacer directement sur main

```bash
# Dans le repo existant (wealthflow-fullstack-2)
git checkout main
rm -rf backend/  # Supprimer l'ancien backend
cp -r /chemin/vers/wealthflow-v2/backend ./  # Copier le nouveau
git add backend/
git commit -m "feat: Migrate to backend V2 (38 endpoints)"
git push origin main
```

#### Option B : Créer une branche v2 (recommandé)

```bash
# Dans le repo existant
git checkout -b v2
rm -rf backend/
cp -r /chemin/vers/wealthflow-v2/backend ./
git add backend/
git commit -m "feat: Migrate to backend V2 (38 endpoints)"
git push origin v2
```

Puis dans **Render Dashboard** :
- Settings → Branch → Changer vers `v2`
- Save Changes

### ÉTAPE 3 : Ajuster render.yaml (si nécessaire)

Si le service existant n'utilise pas `render.yaml`, configurer manuellement dans Render :

**Build Command** :
```bash
npm ci --include=dev && npm run prisma:generate && npm run build
```

**Start Command** :
```bash
NODE_ENV=production npm run prisma:deploy && npm start
```

**Root Directory** :
```
backend
```

### ÉTAPE 4 : Vérifier les variables d'environnement

Dans **Render Dashboard** → **Environment**, assurez-vous d'avoir :

| Variable | Description | Statut |
|----------|-------------|--------|
| `DATABASE_URL` | URL Supabase (déjà configuré) | ✅ Garder |
| `JWT_SECRET` | Secret JWT actuel | ⚠️ Peut changer |
| `JWT_REFRESH_SECRET` | Secret refresh token | 🆕 Ajouter |
| `FRONTEND_URL` | URL Netlify du frontend V2 | ⚠️ Mettre à jour |
| `NPM_CONFIG_INCLUDE` | Force devDependencies | 🆕 Ajouter `dev` |

**⚠️ Important** :
- Si vous changez `JWT_SECRET`, tous les tokens existants seront invalidés
- Option 1 : Garder l'ancien secret (continuité)
- Option 2 : Nouveau secret (tous les users doivent se reconnecter)

### ÉTAPE 5 : Redéployer

1. Push les changements sur GitHub
2. Render détectera automatiquement le push
3. Ou cliquez sur **"Manual Deploy"**

### ÉTAPE 6 : Tester

```bash
# Test 1 : Health check
curl https://wealthflow-fullstack-2.onrender.com/health

# Test 2 : Database
curl https://wealthflow-fullstack-2.onrender.com/api/health

# Test 3 : Nouveaux endpoints V2
curl https://wealthflow-fullstack-2.onrender.com/api/categories
```

---

## 🔄 MIGRATION DES DONNÉES

### La base de données Supabase reste la même ✅

Le backend V2 utilise le **même schéma Prisma** adapté à votre base Supabase existante :
- ✅ Tables User, Account, Transaction, Category existantes
- 🆕 Nouvelles tables : SavingsGoal, SavingsDeposit, Budget, BudgetCategory, Notification

### Que va-t-il se passer ?

1. **Au premier déploiement** : `npm run prisma:deploy` créera les **nouvelles tables**
2. **Les données existantes** : Restent intactes (User, Account, Transaction)
3. **Les nouvelles fonctionnalités** : Utilisent les nouvelles tables

---

## ⚠️ POINTS D'ATTENTION

### 1. Schéma User

Le backend V2 utilise `firstName` + `lastName` au lieu de `name`.

**Si votre DB V1 a un champ `name`** :
- Option A : Migrer les données (créer firstName/lastName depuis name)
- Option B : Adapter le backend V2 pour utiliser `name`

### 2. JWT Tokens

Si vous changez `JWT_SECRET` :
- ❌ Tous les tokens actuels deviennent invalides
- 👥 Tous les utilisateurs devront se reconnecter

**Recommandation** : Garder le même `JWT_SECRET` pour la continuité

### 3. Frontend

Le frontend doit pointer vers :
- Même URL : `https://wealthflow-fullstack-2.onrender.com/api`
- Pas de changement si vous réutilisez le service

---

## 🎯 CHECKLIST FINALE

### Avant déploiement :
- [ ] Backup V1 créé (branche backup-v1)
- [ ] Backend V2 copié dans le repo existant
- [ ] render.yaml ou Build/Start commands configurés
- [ ] Variables d'environnement vérifiées
- [ ] Frontend V2 configuré avec la bonne URL

### Après déploiement :
- [ ] Health check OK
- [ ] Database connectée
- [ ] Nouveaux endpoints fonctionnels
- [ ] Frontend V2 connecté et testé
- [ ] Migration Prisma réussie (nouvelles tables créées)

---

## 🚀 ROLLBACK SI PROBLÈME

Si le déploiement V2 échoue :

```bash
# Retour à V1
git checkout main
git reset --hard backup-v1
git push -f origin main
```

Ou dans Render :
- Settings → Branch → Revenir à `backup-v1`

---

## 📊 RÉSULTAT ATTENDU

✅ **Backend V2 déployé** sur https://wealthflow-fullstack-2.onrender.com  
✅ **38 endpoints V2** disponibles  
✅ **Base de données** Supabase avec nouvelles tables  
✅ **Frontend V2** Netlify connecté  
✅ **Même service Render** réutilisé  

---

**Migration V1 → V2 Backend**  
Date : Septembre 2026
