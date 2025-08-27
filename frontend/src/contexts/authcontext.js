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
          const token = refreshResp.data.accessToken;
            setAccessToken(token);
            api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            // Si aucun identifier (cookie manquant) on tente de le récupérer du token
            if (!Cookies.get('userId')) {
              const payload = safeDecodeJwt(token);
              if (payload?.userId) {
                Cookies.set('userId', payload.userId, { secure: true, sameSite: 'strict', expires: 7 });
                setIdentifier(payload.userId);
              }
            }
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
        const status = err?.response?.status;
        if (status === 401 || status === 404) {
          // utilisateur inexistant ou non autorisé => purge locale
          await logout();
        }
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
      const token = data.accessToken;
      setAccessToken(token);
      api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
      console.log('[AUTH] Authorization header set globally');
      if (!identifier) {
        const payload = safeDecodeJwt(token);
        if (payload?.userId) {
          Cookies.set('userId', payload.userId, { secure: true, sameSite: rememberMe ? 'strict' : 'strict', expires: rememberMe ? 7 : undefined });
          setIdentifier(payload.userId);
        }
      }
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
      const uid = identifier || Cookies.get('userId');
      await api.post("/auth/logout", { userId: uid });
    } catch (e) {
      console.warn('[AUTH] logout error ignorée:', e?.response?.data || e.message);
    }
    setIdentifier(null);
    setUser(null);
    Cookies.remove("userId");
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };

  const isAuthenticated = !!(identifier || accessToken); // plus robuste: token OU identifier

  // Utilitaire local pour décoder un JWT sans lib externe
  function safeDecodeJwt(token) {
    try {
      const base64 = token.split('.')[1];
      const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  return (
  <AuthContext.Provider value={{ user, loading, register, login, logout, isAuthenticated, identifier, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);