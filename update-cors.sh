#!/bin/bash

# 🔧 Script de mise à jour des CORS pour Railway
# À exécuter après le déploiement Railway

echo "🚀 Mise à jour des CORS pour Railway..."

# Remplacez ces URLs par vos vraies URLs Railway
FRONTEND_URL="https://your-frontend-production-xxxx.up.railway.app"

# Fichiers CORS à mettre à jour
CORS_FILES=(
    "Backend/auth-service/config/allowedOrigins.js"
    "Backend/post-service/config/allowedOrigins.js"
    "Backend/user-service/config/allowedOrigins.js"
    "Backend/message-service/config/allowedOrigins.js"
    "Backend/notification-service/config/allowedOrigins.js"
)

for file in "${CORS_FILES[@]}"
do
    if [ -f "$file" ]; then
        echo "Mise à jour de $file..."
        # Sauvegarde
        cp "$file" "$file.backup"
        
        # Remplacement du contenu
        cat > "$file" << EOF
const allowedOrigins = [
    '$FRONTEND_URL',
    'http://localhost:3000', // Développement local
    'http://localhost:80',   // Développement local
];

module.exports = allowedOrigins;
EOF
    else
        echo "❌ Fichier non trouvé: $file"
    fi
done

echo "✅ CORS mis à jour ! N'oubliez pas de :"
echo "1. Remplacer les URLs par vos vraies URLs Railway"
echo "2. Faire un git commit + push pour redéployer"
