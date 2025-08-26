"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { registerUser, loginUser, fetchUserProfile } from "@/utils/api";
import { api } from "@/utils/api"; // axios { baseURL:'/api', withCredentials:true }
import Cookies from "js-cookie";
import { bindLogout } from "@/utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bindLogout(logout);
  }, []);

  // Au montage : tenter un refresh (le cookie refreshToken HttpOnly sera envoyé automatiquement)
  useEffect(() => {
    (async () => {
      try {
        // si refresh OK, le back repose un accessToken en cookie
        await api.post("/auth/refresh-token", {});
        // récupère un identifiant d’utilisateur pour charger le profil
        // (si tu gardes un cookie non-HttpOnly "userId")
        const storedIdentifier = Cookies.get("userId") || null;
        setIdentifier(storedIdentifier);
      } catch {
        // pas connecté => laisser identifier à null
        setIdentifier(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Charger le profil quand on a un identifier
  useEffect(() => {
    const run = async () => {
      if (!identifier) {
        setUser(null);
        return;
      }
      try {
        const profile = await fetchUserProfile(identifier);
        setUser(profile);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setUser(null);
      }
    };
    run();
  }, [identifier]);

  // — Inscription
  const register = async (email, username, password) => {
    const data = await registerUser(email, username, password);
    // le back doit poser les cookies; on récupère éventuellement l'id pour charger le profil
    const id = data?.userId;
    if (id) {
      Cookies.set("userId", id, { secure: true, sameSite: "strict", expires: 7 });
      setIdentifier(id);
    }
  };

  // — Connexion
  const login = async (idOrEmail, password, rememberMe = false) => {
    const data = await loginUser(idOrEmail, password);
    // le back POSE les cookies (access+refresh). Ici, on ne lit pas d'accessToken.
    const id = data?.userId;
    if (id) {
      if (rememberMe) {
        Cookies.set("userId", id, { secure: true, sameSite: "strict", expires: 7 });
      } else {
        Cookies.set("userId", id, { secure: true, sameSite: "strict" }); // cookie de session
      }
      setIdentifier(id);
    } else {
      // si ton back ne renvoie pas l'id, préfère une route /auth/me côté back
      // ou renvoie-le dans la réponse de login
      console.warn("userId manquant dans la réponse de login");
    }
  };

  const logout = async () => {
    try {
      // si tu as une route pour nettoyer les cookies côté serveur
      await api.post("/auth/logout", {});
    } catch {}
    setIdentifier(null);
    setUser(null);
    Cookies.remove("userId");
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);