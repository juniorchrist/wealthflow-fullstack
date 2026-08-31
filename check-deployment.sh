#!/bin/bash

# ============================================================
# Script de vérification de déploiement WealthFlow
# Teste la connexion entre Frontend, Backend et Supabase
# ============================================================

echo "🔍 Vérification du déploiement WealthFlow"
echo "=========================================="
echo ""

# Couleurs pour le output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester une URL
test_url() {
    local url=$1
    local name=$2
    
    echo -n "Testing $name... "
    
    if curl -s -f -o /dev/null "$url" 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Fonction pour tester l'API
test_api() {
    local api_url=$1
    
    echo -n "Testing API health endpoint... "
    
    response=$(curl -s "$api_url/health" 2>&1)
    
    if echo "$response" | grep -q "status"; then
        echo -e "${GREEN}✓ OK${NC}"
        echo "  Response: $response"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Response: $response"
        return 1
    fi
}

# Demander les URLs
echo "Veuillez entrer les URLs de déploiement :"
echo ""

read -p "Backend Render URL (ex: https://wealthflow-api.onrender.com): " BACKEND_URL
read -p "Frontend Netlify URL (ex: https://wealthflow-app.netlify.app): " FRONTEND_URL

# Nettoyer les URLs (enlever le slash final)
BACKEND_URL=${BACKEND_URL%/}
FRONTEND_URL=${FRONTEND_URL%/}

echo ""
echo "=========================================="
echo "Test des connexions"
echo "=========================================="
echo ""

# Test 1: Backend est accessible
test_url "$BACKEND_URL" "Backend Render"
BACKEND_STATUS=$?

# Test 2: Frontend est accessible
test_url "$FRONTEND_URL" "Frontend Netlify"
FRONTEND_STATUS=$?

# Test 3: API health endpoint
if [ $BACKEND_STATUS -eq 0 ]; then
    test_api "$BACKEND_URL/api"
    API_STATUS=$?
else
    echo -e "${YELLOW}⊘ Skipping API test (backend not accessible)${NC}"
    API_STATUS=1
fi

# Test 4: CORS (optionnel - nécessite un test plus complexe)
echo ""
echo -e "${YELLOW}ℹ Note: Pour tester CORS, ouvrez le frontend dans un navigateur et vérifiez la console${NC}"

# Résumé
echo ""
echo "=========================================="
echo "Résumé"
echo "=========================================="

if [ $BACKEND_STATUS -eq 0 ] && [ $FRONTEND_STATUS -eq 0 ] && [ $API_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓ Tous les tests sont passés !${NC}"
    echo ""
    echo "Prochaines étapes :"
    echo "1. Ouvrez $FRONTEND_URL dans votre navigateur"
    echo "2. Testez l'inscription/connexion"
    echo "3. Vérifiez que les données sont sauvegardées dans Supabase"
    exit 0
else
    echo -e "${RED}✗ Certains tests ont échoué${NC}"
    echo ""
    echo "Dépannage :"
    if [ $BACKEND_STATUS -ne 0 ]; then
        echo "- Backend: Vérifiez les logs Render et que le service est 'Live'"
    fi
    if [ $FRONTEND_STATUS -ne 0 ]; then
        echo "- Frontend: Vérifiez les logs Netlify et que le déploiement est réussi"
    fi
    if [ $API_STATUS -ne 0 ]; then
        echo "- API: Vérifiez que /api/health endpoint existe et que DATABASE_URL est correcte"
    fi
    exit 1
fi
