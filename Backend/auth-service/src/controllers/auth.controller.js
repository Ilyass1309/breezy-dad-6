const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");

exports.refreshToken = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;

  if (!oldRefreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const userServiceURL = process.env.USER_SERVICE_URL;

    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const username = decoded.userInfo.username;
    const userId = decoded.userInfo.userId;

    // 1. Vérifie l'ancien refreshToken
    const userExists = await axios.get(
      `${userServiceURL}/api/users/check-username?username=${username}`
    );

    if (userExists == false) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 2. Génère un nouveau accessToken
    const newAccessToken = jwt.sign({ userId }, process.env.ACCESS_JWT_KEY, {
      expiresIn: "15m",
    });

    // 3. Génère un nouveau refreshToken (rotation)
    const newRefreshToken = jwt.sign(
      {
        userInfo: {
          userId: userId,
          username: username,
        },
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // 4. Remplace dans la base (remplace l'ancien)
    await axios.post(`${userServiceURL}/api/users/${userId}/refreshTokens`, {
      refreshToken: newRefreshToken,
    });

    // 5. Met à jour le cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false, // true en prod HTTPS
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    // 6. Réponse au client
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh token error:", err.message);
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

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

    // Création du user côté user-service
    const { data: user } = await axios.post(
      `${userServiceURL}/api/users`,
      userPayload,
      { timeout: 3000 }
    );

    // Génération de tokens
    const accessToken = jwt.sign(
      {
        userId: user.userId,
        username: user.username,
      },
      process.env.ACCESS_JWT_KEY,
      { expiresIn: "10s" } // Token court (10 s)
    );

    const refreshToken = jwt.sign(
      {
        userInfo: {
          userId: user.userId,
          username: user.username,
        },
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Stocker le refreshToken côté user-service
    await axios.post(
      `${userServiceURL}/api/users/${user.userId}/refreshTokens`,
      { refreshToken }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // durée de vie 7 jours
    });

    res.status(201).json({
      msg: "New User created!",
      accessToken,
      userId: user.userId,
    });
  } catch (err) {
    if (err.response) {
      console.error(
        "user-service responded with:",
        err.response.status,
        err.response.data
      );
      return res.status(err.response.status).json({
        error: err.response.data.error || "user-service rejected the request",
      });
    } else {
      console.error("user-service unreachable:", err.message);
      return res.status(500).json({ error: "user-service unreachable" });
    }
  }
};

// LOGIN : demande les données à user-service
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    console.log("Login request body:", req.body);

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Missing identifier or password" });
    }

    const userServiceURL = process.env.USER_SERVICE_URL;

    // Récupération des infos utilisateur pour login
    const { data: user } = await axios.get(
      `${userServiceURL}/api/users/auth-data`,
      { params: { identifier } }
    );

    const isPasswordValid = bcrypt.compareSync(password, user.hashedPassword);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid email/username or password" });
    }

    // Création du accessToken court (10 min)
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.ACCESS_JWT_KEY,
      { expiresIn: "10s" }
    );

    const refreshToken = jwt.sign(
      {
        userInfo: {
          userId: user.id,
          username: user.username,
        },
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Stocker le refreshToken côté user-service
    await axios.post(`${userServiceURL}/api/users/${user.id}/refreshTokens`, {
      refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // durée de vie 7 jours
    });

    res.status(200).json({
      message: "You are now connected!",
      accessToken,
      userId: user.id,
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res
        .status(401)
        .json({ message: "Invalid email/username or password" });
    }
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Internal server error", err });
  }
};

// AUTHENTICATE : vérifie le token JWT
exports.verifyToken = (req, res) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.slice(7); // Enlève "Bearer "
  console.log(token);

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_JWT_KEY);
    return res.status(200).json({ user: decoded });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

exports.logout = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }

  try {
    const userServiceURL = process.env.USER_SERVICE_URL;

    // Appel au user-service pour supprimer le refresh token stocké
    await axios.delete(`${userServiceURL}/api/users/${userId}/refreshTokens`);

    // Suppression du cookie côté client
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // ou true si HTTPS
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Successfully logged out" });
  } catch (err) {
    console.error("Logout error:", err.message);
    return res.status(500).json({ message: "Logout failed" });
  }
};
