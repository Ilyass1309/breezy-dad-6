const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route principale qui sert index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route de santé pour Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Breezy API Gateway is running',
    timestamp: new Date().toISOString(),
    service: 'gateway'
  });
});

// Routes d'information sur les services
app.get('/api', (req, res) => {
  res.json({
    message: 'Breezy API - Microservices Architecture',
    services: [
      { name: 'auth-service', port: 3000 },
      { name: 'user-service', port: 3001 },
      { name: 'message-service', port: 3002 },
      { name: 'post-service', port: 3003 },
      { name: 'notification-service', port: 3004 }
    ],
    deployment: 'Railway'
  });
});

// Gestionnaire d'erreur 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'Cette route n\'existe pas sur le service gateway'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Breezy API Gateway running on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
  console.log(`📋 API info available at: http://localhost:${PORT}/api`);
});

module.exports = app;
