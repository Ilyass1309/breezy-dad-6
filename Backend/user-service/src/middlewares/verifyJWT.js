

const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const verifyJWT = async (req, res, next) => {
  let authHeader = req.headers['authorization'];

  // Essaye de récupérer le token depuis le cookie si pas d'en-tête
  if (!authHeader && req.cookies?.accessToken) {
    authHeader = 'Bearer ' + req.cookies.accessToken;
    console.log('[verifyJWT] Token récupéré depuis cookie accessToken');
  }

  console.log('[verifyJWT] Authorization header (final):', authHeader);

  if (!authHeader) {
    console.warn('[verifyJWT] Aucun token trouvé (ni header ni cookie)');
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  try {

    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
    const verifyUrl = authServiceUrl.replace(/\/$/, '') + '/api/auth/verify';
    const response = await axios.get(verifyUrl, {
      headers: { Authorization: authHeader },
    });

    console.log('[verifyJWT] Auth-service /auth/verify response:', response.data);

    // Stocke les infos utilisateur pour la suite
    req.user = response.data.user;
    req.userId = response.data.user.userId;

    next(); // continue
  } catch (err) {
    console.error('[verifyJWT] Error verifying JWT:', err.response ? err.response.data : err.message);
    return res.status(401).json({ message: 'Unauthorized', details: err.response ? err.response.data : err.message });
  }
};

module.exports = verifyJWT;
