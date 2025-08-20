const axios = require('axios');

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  try {
    const response = await axios.get('http://auth-service:3000/auth/verify', {
      headers: { Authorization: authHeader }
    });

    req.user = response.data.user;
    req.userId = response.data.user.userId;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = verifyJWT;
