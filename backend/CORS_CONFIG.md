# Configuration CORS - WealthFlow V2

## Vue d'ensemble

WealthFlow V2 utilise une configuration CORS flexible et sécurisée qui permet au frontend hébergé sur différentes plateformes (Netlify, InfinityFree, localhost) de communiquer avec le backend sur Render.

## Configuration actuelle

### Backend (Render)
- **URL API**: `https://wealthflow-fullstack-2.onrender.com/api`
- **Fichier de configuration**: `backend/src/app.ts`
- **Stratégie CORS**: Dynamique - renvoie l'origine appelante si elle est autorisée

### Frontend autorisé
Les URLs frontend sont configurées dans `backend/.env` via la variable `FRONTEND_URL` :

```env
FRONTEND_URL="https://fluffy-panda-d9b796.netlify.app,http://localhost:5173,http://localhost:3000"
```

## Comment ajouter un nouveau domaine

### 1. Domaine InfinityFree
Si vous déployez sur InfinityFree, ajoutez votre domaine à la variable `FRONTEND_URL` :

```env
FRONTEND_URL="https://fluffy-panda-d9b796.netlify.app,https://votre-app.infinityfreeapp.com,http://localhost:5173"
```

### 2. Domaine personnalisé
Pour un domaine personnalisé (ex: `https://wealthflow.com`) :

```env
FRONTEND_URL="https://fluffy-panda-d9b796.netlify.app,https://wealthflow.com,http://localhost:5173"
```

### 3. Plusieurs domaines
Séparez les URLs par des virgules :

```env
FRONTEND_URL="https://prod.netlify.app,https://staging.netlify.app,https://app.infinityfreeapp.com,http://localhost:5173"
```

## Déployer sur Render

Après avoir modifié `FRONTEND_URL`, redéployez le backend sur Render :

1. **Via Dashboard Render**:
   - Allez dans Settings → Environment
   - Modifiez la variable `FRONTEND_URL`
   - Cliquez sur "Manual Deploy" → "Deploy latest commit"

2. **Via Git**:
   ```bash
   git add backend/.env
   git commit -m "Update CORS allowed origins"
   git push
   ```
   Render redéploiera automatiquement.

## Configuration CORS dans app.ts

Le middleware CORS actuel est **très permissif** et accepte toutes les origines :

```typescript
// Renvoie l'origine appelante pour tout client Web
res.setHeader('Access-Control-Allow-Origin', cleanOrigin);
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

### Pourquoi cette approche ?

✅ **Avantages** :
- Fonctionne avec n'importe quel hébergeur (Netlify, Vercel, InfinityFree, etc.)
- Permet les JWT Bearer tokens via `Access-Control-Allow-Credentials`
- Pas de blocage CORS pendant le développement

⚠️ **Sécurité** :
- L'authentification JWT protège les endpoints
- Le middleware `requireAuth` vérifie chaque token
- Les refresh tokens sont stockés côté serveur

### Pour une sécurité renforcée (optionnel)

Si vous voulez restreindre explicitement les origines, modifiez `backend/src/app.ts` :

```typescript
// Liste blanche stricte
const allowedOrigins = new Set(env.frontend.allowedUrls);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // ... reste du middleware
});
```

## Vérification

### Tester CORS depuis le navigateur

1. Ouvrez la console du navigateur sur votre frontend
2. Exécutez :

```javascript
fetch('https://wealthflow-fullstack-2.onrender.com/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ CORS OK:', data))
  .catch(err => console.error('❌ CORS Error:', err));
```

### Vérifier les headers CORS

```bash
curl -I -X OPTIONS \
  -H "Origin: https://fluffy-panda-d9b796.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  https://wealthflow-fullstack-2.onrender.com/api/auth/login
```

Vous devriez voir :
```
Access-Control-Allow-Origin: https://fluffy-panda-d9b796.netlify.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

## Dépannage

### Erreur : "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause** : Le backend ne renvoie pas les bons headers CORS.

**Solutions** :
1. Vérifiez que `FRONTEND_URL` contient votre domaine
2. Redéployez le backend après modification
3. Videz le cache du navigateur (Ctrl+Shift+R)

### Erreur : "CORS policy: credentials mode is 'include'"

**Cause** : Le frontend envoie `credentials: 'include'` mais le backend ne renvoie pas `Access-Control-Allow-Credentials: true`.

**Solution** : C'est déjà configuré dans `app.ts`, vérifiez que le backend est bien déployé avec la dernière version.

### Erreur : "Failed to fetch"

**Causes possibles** :
1. Le backend Render est en mode "sleep" (plan gratuit) - attendez 30s
2. URL API incorrecte - vérifiez `src/services/api.ts` : `API_BASE_URL`
3. Certificat SSL invalide (rare avec Render)

## Frontend : Configuration API

Assurez-vous que le frontend pointe vers le bon backend dans `src/services/api.ts` :

```typescript
const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL 
    || (import.meta as any).env?.VITE_BACKEND_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://wealthflow-fullstack-2.onrender.com/api';
};
```

Variables d'environnement frontend (`.env` à la racine du frontend) :

```env
VITE_API_URL=https://wealthflow-fullstack-2.onrender.com/api
```

## Résumé des URLs

| Plateforme | Type | URL |
|------------|------|-----|
| **Backend** | API | `https://wealthflow-fullstack-2.onrender.com/api` |
| **Frontend Netlify** | Production | `https://fluffy-panda-d9b796.netlify.app` |
| **Frontend InfinityFree** | Alternative | *(à configurer)* |
| **Frontend Local** | Développement | `http://localhost:5173` |

## Support

Pour tout problème CORS :
1. Vérifiez les logs Render : Dashboard → Logs
2. Vérifiez la console navigateur : F12 → Network
3. Testez avec curl pour isoler le problème
