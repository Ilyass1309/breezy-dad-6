const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
const mongoose = require("mongoose");

// Health check
exports.health = (req, res) => {
  res.status(200).json({ ok: true, service: "auth-service" });
};

exports.ready = (req, res) => {
  const mongoState = mongoose.connection.readyState; // 1 = connecté
  res.status(mongoState === 1 ? 200 : 503).json({
    ok: mongoState === 1,
    mongoState,
    service: "auth-service",
  });
};

// ============== REFRESH TOKEN ==============
exports.refreshToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const userServiceURL = process.env.USER_SERVICE_URL;

    // Vérifie & décode l'ancien refresh
    const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const username = decoded.userInfo.username;
    const userId = decoded.userInfo.userId;

    // Vérifie l'existence utilisateur côté user-service
    const { data: exists } = await axios.get(
      `${userServiceURL}/api/users/check-username`,
      { params: { username } }
    );
    if (!exists) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Nouveau access (15 min)
    const newAccessToken = jwt.sign(
      { userId, username },
      process.env.ACCESS_JWT_KEY,
      { expiresIn: "15m" }
    );

    // Rotation refresh (7 jours)
    const newRefreshToken = jwt.sign(
      { userInfo: { userId, username } },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Stocke le nouveau refresh côté user-service
    await axios.post(`${userServiceURL}/api/users/${userId}/refreshTokens`, {
      refreshToken: newRefreshToken,
    });

    // Pose les cookies (⚠️ mêmes options partout : sameSite 'none', path)
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/api",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

  return res.status(200).json({ ok: true, accessToken: newAccessToken });
  } catch (err) {
    console.error("[REFRESH] Error:", err.message);
    // 403 si token invalide/expiré
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

// ============== REGISTER ==============
exports.register = async (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const userPayload = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      role: "user",
    };

    const userServiceURL = process.env.USER_SERVICE_URL;

    // Création user côté user-service
    const { data: user } = await axios.post(
      `${userServiceURL}/api/users`,
      userPayload,
      { timeout: 15000 }
    );

    // Tokens
    const accessToken = jwt.sign(
      { userId: user.userId, username: user.username },
      process.env.ACCESS_JWT_KEY,
      { expiresIn: "10m" } // ← 10 minutes (au lieu de 10s)
    );

    const refreshToken = jwt.sign(
      { userInfo: { userId: user.userId, username: user.username } },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Stocke refresh côté user-service
    await axios.post(
      `${userServiceURL}/api/users/${user.userId}/refreshTokens`,
      { refreshToken }
    );

    // Cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/api",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      msg: "New User created!",
      userId: user.userId,
    });
  } catch (err) {
    if (err.response) {
      console.error("user-service responded with:", err.response.status, err.response.data);
      return res.status(err.response.status).json({
        error: err.response.data.error || "user-service rejected the request",
      });
    } else {
      console.error("user-service unreachable:", err.message);
      return res.status(500).json({ error: "user-service unreachable" });
    }
  }
};

// ============== LOGIN ==============
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: "Missing identifier or password" });
    }

    const userServiceURL = process.env.USER_SERVICE_URL;

    // Récupère les données d'auth (hashedPassword, id, username)
    const { data: user } = await axios.get(
      `${userServiceURL}/api/users/auth-data`,
      { params: { identifier } }
    );

    const isPasswordValid = bcrypt.compareSync(password, user.hashedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email/username or password" });
    }

    // Tokens
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.ACCESS_JWT_KEY,
      { expiresIn: "10m" }
    );

    const refreshToken = jwt.sign(
      { userInfo: { userId: user.id, username: user.username } },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Stocke refresh côté user-service
    await axios.post(`${userServiceURL}/api/users/${user.id}/refreshTokens`, {
      refreshToken,
    });

    // Cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/api",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "You are now connected!",
  userId: user.id,
  accessToken, // add token in body so frontend can set Authorization header manually
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(401).json({ message: "Invalid email/username or password" });
    }
    console.error("[LOGIN] Error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============== VERIFY TOKEN ==============
// Lit d'abord le cookie accessToken ; fallback sur Authorization si présent
exports.verifyToken = (req, res) => {
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_JWT_KEY);
    return res.status(200).json({ user: decoded });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ============== LOGOUT ==============
exports.logout = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }

  try {
    const userServiceURL = process.env.USER_SERVICE_URL;

    // Supprime le refresh côté user-service
    await axios.delete(`${userServiceURL}/api/users/${userId}/refreshTokens`);

    // Efface les cookies (mêmes options + path)
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/api",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/api/auth",
    });

    return res.status(200).json({ message: "Successfully logged out" });
  } catch (err) {
    console.error("Logout error:", err.message);
    return res.status(500).json({ message: "Logout failed" });
  }
};
