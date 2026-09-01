# ✅ Checklist de Vérification - Déploiement Render

Après que Render ait détecté et traité les nouveaux commits, suivez cette checklist pour vérifier que le déploiement fonctionne :

---

## 📊 Étape 1 : Vérifier le Statut du Déploiement sur Render

1. Allez sur le **Tableau de Bord Render** : https://dashboard.render.com
2. Sélectionnez votre service **wealthflow-api**
3. Vérifiez les éléments suivants :

- [ ] **Logs du déploiement** affichent un message de succès (vert)
- [ ] Aucune erreur TypeScript mentionnée
- [ ] La compilation s'est terminée sans problème
- [ ] Le service est en état **Live** (vert)

**Logs à Rechercher** : Si vous voyez ces messages, c'est bon signe :
```
✔ Generated Prisma Client
> wealthflow-backend@2.0.0 build
npm run start
```

---

## 🌐 Étape 2 : Tester l'API

### Test du Health Check

```bash
curl https://wealthflow-api.onrender.com/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "timestamp": "2026-09-01T...",
  "uptime": 123,
  "db": "ok"
}
```

### Test de la Racine API

```bash
curl https://wealthflow-api.onrender.com/
```

**Réponse attendue** :
```json
{
  "service": "WealthFlow API",
  "version": "2.0.0",
  "status": "online",
  "environment": "production",
  "endpoints": { ... }
}
```

---

## 🔐 Étape 3 : Vérifier les Variables d'Environnement

Allez dans **Settings > Environment Variables** et vérifiez que les variables sont configurées :

- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = (PostgreSQL connection string)
- [ ] `JWT_SECRET` = (your JWT secret)
- [ ] `JWT_EXPIRES_IN` = `7d`
- [ ] `CORS_ORIGIN` = (votre URL frontend)

Si des variables manquent, **le service ne démarrera pas correctement**.

---

## 🧪 Étape 4 : Tester Depuis le Frontend

1. Ouvrez votre application WealthFlow
2. Essayez de vous connecter ou de faire une requête API
3. Vérifiez dans la **Console du Navigateur** (F12) qu'il n'y a pas d'erreurs CORS

**Erreur Courante** : Si vous voyez une erreur CORS, vérifiez que `CORS_ORIGIN` est correctement définie sur Render.

---

## 📋 Étape 5 : Consulter les Logs en Temps Réel

Sur le tableau de bord Render :

1. Cliquez sur **Logs** en haut à droite
2. Sélectionnez l'onglet **Deploy** pour voir les logs de compilation
3. Sélectionnez l'onglet **Runtime** pour voir les logs du serveur en cours d'exécution

**Cherchez** :
- Erreurs TypeScript ❌
- Erreurs de base de données ❌
- Messages normaux du serveur ✅

---

## 🔄 Si le Déploiement Échoue

### Option 1 : Redéployer Manuellement
1. Allez sur le tableau de bord Render
2. Cliquez sur **Manual Deploy** > **Deploy Latest Commit**

### Option 2 : Vérifier les Erreurs Spécifiques
1. Consultez les logs de déploiement
2. Cherchez les lignes commençant par `error` ou `ERROR`
3. Si vous voyez une erreur TypeScript, comparez avec `DEPLOYMENT_FIXES.md`

### Option 3 : Réinitialiser le Cache
1. Allez sur **Settings** > **Clear Build Cache**
2. Relancez un déploiement manuel

---

## 📞 Support & Documentation

Si vous rencontrez toujours des erreurs :

- 📖 Lire : `DEPLOYMENT_FIXES.md` (explique toutes les corrections)
- 📺 Vérifier : Les logs de compilation sur Render
- 🔗 Documentation Render : https://docs.render.com/deploy-node

---

## ✨ Success Criteria

Votre déploiement est réussi quand :

✅ L'API répond aux appels HTTP  
✅ Pas d'erreurs TypeScript dans les logs  
✅ Le service est en état **Live**  
✅ Les health checks passent  
✅ Le frontend peut communiquer avec l'API  

---

**Date** : 2026-09-01  
**Mise à jour** : Après le push des corrections
