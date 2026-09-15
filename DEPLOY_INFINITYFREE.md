# Déploiement WealthFlow V2 sur InfinityFree

## Vue d'ensemble

InfinityFree est un hébergeur web gratuit qui permet d'héberger des applications frontend statiques. Ce guide explique comment déployer le frontend WealthFlow V2 sur InfinityFree tout en conservant le backend sur Render.

## Architecture

```
Frontend (InfinityFree)  ←→  Backend API (Render)  ←→  Database (Supabase)
https://votre-app.infinityfreeapp.com    https://wealthflow-fullstack-2.onrender.com/api
```

## Prérequis

1. Compte InfinityFree (gratuit) : https://infinityfree.net/
2. Backend déjà déployé sur Render
3. Build du frontend prêt

## Étape 1 : Préparer le build du frontend

### 1.1 Vérifier la configuration API

Dans `src/services/api.ts`, vérifiez que l'URL du backend est correcte :

```typescript
const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL 
    || (import.meta as any).env?.VITE_BACKEND_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://wealthflow-fullstack-2.onrender.com/api'; // URL par défaut
};
```

### 1.2 Configurer les variables d'environnement

Créez/modifiez le fichier `.env` à la racine du projet frontend :

```env
VITE_API_URL=https://wealthflow-fullstack-2.onrender.com/api
```

### 1.3 Builder le frontend

```bash
npm run build
```

Cela créera un dossier `dist/` contenant tous les fichiers statiques.

## Étape 2 : Configurer InfinityFree

### 2.1 Créer un compte

1. Allez sur https://infinityfree.net/
2. Cliquez sur "Sign Up"
3. Créez votre compte gratuitement

### 2.2 Créer un nouveau site

1. Depuis le panneau de contrôle, cliquez sur "Create Account"
2. Choisissez un sous-domaine (ex: `wealthflow.infinityfreeapp.com`)
3. Ou utilisez votre propre domaine si vous en avez un
4. Attendez la création du compte (quelques minutes)

### 2.3 Accéder au File Manager

1. Depuis le panneau de contrôle, cliquez sur "File Manager" (ou utilisez un client FTP)
2. Naviguez vers le dossier `htdocs/` (c'est la racine publique)

## Étape 3 : Uploader les fichiers

### Option A : Via File Manager Web

1. Dans `htdocs/`, **supprimez** tous les fichiers par défaut
2. Uploadez **tout le contenu** du dossier `dist/` dans `htdocs/`
3. Structure finale dans `htdocs/` :
   ```
   htdocs/
   ├── index.html
   ├── assets/
   │   ├── index-abc123.js
   │   ├── index-abc123.css
   │   └── ...
   └── ...
   ```

### Option B : Via FTP (plus rapide pour de gros fichiers)

1. Téléchargez un client FTP comme FileZilla
2. Récupérez vos identifiants FTP depuis le panneau InfinityFree
3. Connectez-vous via FTP
4. Uploadez tout le contenu de `dist/` dans `htdocs/`

## Étape 4 : Configurer le fichier .htaccess

InfinityFree supporte Apache, créez un fichier `.htaccess` dans `htdocs/` :

```apache
# Activer le module de réécriture
RewriteEngine On

# Forcer HTTPS (recommandé)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Rediriger toutes les routes vers index.html (pour React Router / SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Activer la compression GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Activer le cache navigateur
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>

# Sécurité : empêcher l'accès aux fichiers sensibles
<FilesMatch "\.(env|env\.example|json|md|git)$">
  Order allow,deny
  Deny from all
</FilesMatch>
```

**Important** : Uploadez ce fichier `.htaccess` dans `htdocs/` (même dossier que `index.html`)

## Étape 5 : Configurer CORS sur le backend

### 5.1 Ajouter votre domaine InfinityFree

Dans `backend/.env`, ajoutez votre domaine InfinityFree à `FRONTEND_URL` :

```env
FRONTEND_URL="https://fluffy-panda-d9b796.netlify.app,https://wealthflow.infinityfreeapp.com,http://localhost:5173"
```

### 5.2 Redéployer le backend sur Render

1. Allez sur https://dashboard.render.com/
2. Sélectionnez votre service backend
3. Allez dans "Environment"
4. Modifiez la variable `FRONTEND_URL` en ajoutant votre domaine InfinityFree
5. Cliquez sur "Manual Deploy" → "Deploy latest commit"

Ou via Git :

```bash
cd backend
git add .env
git commit -m "Add InfinityFree domain to CORS"
git push
```

## Étape 6 : Tester l'application

1. Ouvrez votre navigateur
2. Allez sur `https://votre-app.infinityfreeapp.com`
3. Testez la connexion / inscription
4. Vérifiez la console du navigateur (F12) pour les erreurs CORS

### Test CORS

Ouvrez la console du navigateur et exécutez :

```javascript
fetch('https://wealthflow-fullstack-2.onrender.com/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ Backend accessible:', data))
  .catch(err => console.error('❌ Erreur CORS:', err));
```

Si vous voyez `✅ Backend accessible`, tout fonctionne correctement.

## Dépannage

### Problème : Erreur CORS

**Symptôme** : `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions** :
1. Vérifiez que votre domaine InfinityFree est dans `FRONTEND_URL` du backend
2. Redéployez le backend après modification
3. Videz le cache du navigateur (Ctrl+Shift+R)

### Problème : Page blanche sur InfinityFree

**Causes possibles** :
1. Mauvaise structure de dossiers - vérifiez que `index.html` est à la racine de `htdocs/`
2. Fichier `.htaccess` manquant - créez-le avec la configuration ci-dessus
3. Erreurs JavaScript - vérifiez la console du navigateur (F12)

### Problème : Routes ne fonctionnent pas (404)

**Cause** : Le fichier `.htaccess` est manquant ou mal configuré.

**Solution** : Uploadez le fichier `.htaccess` avec la configuration ci-dessus dans `htdocs/`

### Problème : "Failed to fetch" ou délai d'attente

**Causes possibles** :
1. Le backend Render est en mode "sleep" (plan gratuit) - attendez 30 secondes
2. URL API incorrecte dans `.env` - vérifiez `VITE_API_URL`
3. Firewall InfinityFree bloque les requêtes sortantes (rare)

### Problème : Modifications non visibles

**Solution** : Videz le cache du navigateur :
- Chrome/Edge : Ctrl+Shift+R
- Firefox : Ctrl+F5
- Safari : Cmd+Option+R

## Mise à jour de l'application

Pour mettre à jour l'application déployée :

```bash
# 1. Faire les modifications dans le code
# 2. Rebuilder le frontend
npm run build

# 3. Uploader les nouveaux fichiers dans htdocs/
# Via File Manager ou FTP, écrasez les anciens fichiers

# 4. Vider le cache du navigateur pour voir les changements
```

## Limitations InfinityFree

⚠️ **À noter** :
- Pas de support Node.js (backend doit rester sur Render)
- Bande passante limitée (5GB/mois sur le plan gratuit)
- Peut avoir des temps de chargement plus lents que Netlify
- Pas de déploiement automatique via Git (upload manuel requis)
- SSL gratuit inclus mais peut prendre 24h à s'activer

## Alternative recommandée : Netlify

Si vous voulez un déploiement automatique via Git, Netlify est recommandé :

```bash
# Netlify se déploie automatiquement depuis votre repo Git
# Voir DEPLOY_NETLIFY.md pour plus de détails
```

## Support

Pour toute question :
- Documentation InfinityFree : https://forum.infinityfree.net/
- Support WealthFlow : Consultez `CORS_CONFIG.md` pour les problèmes CORS
