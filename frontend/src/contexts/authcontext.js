"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { registerUser, loginUser, fetchUserProfile, refreshToken } from "@/utils/api";
import Cookies from "js-cookie";
import { bindAuthContext, bindLogout } from '@/utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [identifier, setIdentifier] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    bindAuthContext(setAccessTokenFromApi);
    bindLogout(logout);
  }, []);

  useEffect(() => {
    // Vérifie si un token est stocké dans les cookies
    const token = Cookies.get("accessToken");
    const storedIdentifier = Cookies.get("userId");
    if (token) {
      setAccessToken(token);
      setIdentifier(storedIdentifier);
    }
  }, []);

  // Met à jour l'état de l'utilisateur si le token change
  useEffect(() => {
    const fetchUser = async () => {
      if (identifier) {
        try {
          const userProfile = await fetchUserProfile(identifier);
          setUser(userProfile);
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, [identifier]);

  const setAccessTokenFromApi = (newAccessToken) => {
    setAccessToken(newAccessToken);
    Cookies.set("accessToken", newAccessToken, {
          secure: true,
          sameSite: "strict",
          expires: 7,
        });
  }

  // — Inscription
  const register = async (email, username, password) => {
    try {
      const data = await registerUser(email, username, password);
      // Le backend renvoie `accessToken`
      const token = data.accessToken;
      const id = data.userId;
      if (!token) throw new Error("Aucun token reçu à l'inscription");
      setAccessToken(token);
      setIdentifier(id);
    } catch (err) {
      console.error("Register error:", err);
      throw new Error(err.response?.data?.error || err.message);
    }
  };

  // — Connexion
  const login = async (identifier, password, rememberMe = false) => {
    try {
      const data = await loginUser(identifier, password);
      const token = data.accessToken;
      const id = data.userId;
      if (!token) throw new Error("Aucun token reçu à la connexion");
      setAccessToken(token);
      setIdentifier(id);
      if (rememberMe) {
        // Stocke le token et l'identifiant dans un cookie sécurisé
        Cookies.set("accessToken", token, {
          secure: true,
          sameSite: "strict",
          expires: 7,
        });
        Cookies.set("userId", id, {
          secure: true,
          sameSite: "strict",
          expires: 7,
        });
      } else {
        Cookies.remove("accessToken");
        Cookies.remove("userId");
      }
    } catch (err) {
      console.error("Login error:", err);
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setIdentifier(null);
    Cookies.remove("accessToken");
    Cookies.remove("userId");
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, user, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);