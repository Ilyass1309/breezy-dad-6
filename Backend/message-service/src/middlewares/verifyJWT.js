

const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const verifyJWT = async (req, res, next) => {
  let authHeader = req.headers['authorization'];
  if (!authHeader && req.cookies?.accessToken) {
    authHeader = 'Bearer ' + req.cookies.accessToken;
  // log removed
  }

  // log removed

  if (!authHeader) {
  // log removed
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  try {

    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
    const verifyUrl = authServiceUrl.replace(/\/$/, '') + '/api/auth/verify';
    const response = await axios.get(verifyUrl, {
      headers: { Authorization: authHeader },
    });

  // log removed

    // Stocke les infos utilisateur pour la suite
    req.user = response.data.user;
    req.userId = response.data.user.userId;

    next(); // continue
  } catch (err) {
  // log removed
    return res.status(401).json({ message: 'Unauthorized', details: err.response ? err.response.data : err.message });
  }
};

module.exports = verifyJWT;
