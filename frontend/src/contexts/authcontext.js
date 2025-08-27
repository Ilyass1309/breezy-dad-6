"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { registerUser, loginUser, fetchUserProfile } from "@/utils/api";
import { api } from "@/utils/api"; // axios { baseURL:'/api', withCredentials:true }
import Cookies from "js-cookie";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [identifier, setIdentifier] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);



  // Au montage : tenter un refresh (le cookie refreshToken HttpOnly sera envoyé automatiquement)
  useEffect(() => {
    (async () => {
      try {
        // si refresh OK, le back repose un accessToken en cookie
        const refreshResp = await api.post("/auth/refresh-token", {});
        // Si à l'avenir le back renvoie aussi le token dans le body, on le capte
        if (refreshResp?.data?.accessToken) {
          setAccessToken(refreshResp.data.accessToken);
          api.defaults.headers.common['Authorization'] = 'Bearer ' + refreshResp.data.accessToken;
        }
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
        console.log('[AUTH] useEffect: Pas d\'identifier, utilisateur déconnecté');
        setUser(null);
        return;
      }
      try {
        console.log('[AUTH] useEffect: fetchUserProfile appelé avec identifier:', identifier);
        const profile = await fetchUserProfile(identifier);
        console.log('[AUTH] useEffect: fetchUserProfile réponse:', profile);
        setUser(profile);
      } catch (err) {
        console.error('[AUTH] useEffect: Erreur lors de la récupération du profil utilisateur:', err);
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
    console.log('[AUTH] login() called with:', { idOrEmail, password, rememberMe });
    const data = await loginUser(idOrEmail, password);
    console.log('[AUTH] loginUser response:', data);
    // le back POSE les cookies (access+refresh) et maintenant renvoie aussi accessToken
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
      api.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken;
      console.log('[AUTH] Authorization header set globally');
    }
    const id = data?.userId;
    if (id) {
      if (rememberMe) {
        Cookies.set("userId", id, { secure: true, sameSite: "strict", expires: 7 });
        console.log('[AUTH] userId cookie set (persistent):', id);
      } else {
        Cookies.set("userId", id, { secure: true, sameSite: "strict" }); // cookie de session
        console.log('[AUTH] userId cookie set (session):', id);
      }
      setIdentifier(id);
      console.log('[AUTH] setIdentifier called:', id);
    } else {
      // si ton back ne renvoie pas l'id, préfère une route /auth/me côté back
      // ou renvoie-le dans la réponse de login
      console.warn('[AUTH] userId manquant dans la réponse de login');
      throw new Error("Identifiants invalides ou utilisateur non trouvé");
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

  const isAuthenticated = !!identifier; // auth basée sur presence d'un identifiant (ou utilise !!user)

  return (
  <AuthContext.Provider value={{ user, loading, register, login, logout, isAuthenticated, identifier, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);