
const axios = require('axios');

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  console.log('[verifyJWT] Authorization header:', authHeader);

  if (!authHeader) {
    console.warn('[verifyJWT] Authorization header missing');
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  try {
    const response = await axios.get('http://auth-service:3000/auth/verify', {
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
