# 🔧 Script PowerShell de mise à jour des CORS pour Railway
# À exécuter après le déploiement Railway

Write-Host "🚀 Mise à jour des CORS pour Railway..." -ForegroundColor Green

# Remplacez cette URL par votre vraie URL Railway frontend
$FRONTEND_URL = "https://your-frontend-production-xxxx.up.railway.app"

# Fichiers CORS à mettre à jour
$CORS_FILES = @(
    "Backend\auth-service\config\allowedOrigins.js",
    "Backend\post-service\config\allowedOrigins.js", 
    "Backend\user-service\config\allowedOrigins.js",
    "Backend\message-service\config\allowedOrigins.js",
    "Backend\notification-service\config\allowedOrigins.js"
)

foreach ($file in $CORS_FILES) {
    if (Test-Path $file) {
        Write-Host "Mise à jour de $file..." -ForegroundColor Yellow
        
        # Sauvegarde
        Copy-Item $file "$file.backup"
        
        # Nouveau contenu CORS
        $corsContent = @"
const allowedOrigins = [
    '$FRONTEND_URL',
    'http://localhost:3000', // Développement local
    'http://localhost:80',   // Développement local
];

module.exports = allowedOrigins;
"@
        
        # Écriture du nouveau contenu
        $corsContent | Set-Content $file -Encoding UTF8
    }
    else {
        Write-Host "❌ Fichier non trouvé: $file" -ForegroundColor Red
    }
}

Write-Host "✅ CORS mis à jour ! N'oubliez pas de :" -ForegroundColor Green
Write-Host "1. Remplacer les URLs par vos vraies URLs Railway" -ForegroundColor Cyan
Write-Host "2. Faire un git commit + push pour redéployer" -ForegroundColor Cyan
