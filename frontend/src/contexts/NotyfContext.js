"use client";
import { createContext, useContext, useRef } from "react";
import { Notyf } from "notyf";

export const NotyfContext = createContext(null);

export function NotyfProvider({ children }) {
  // Utilise useRef pour ne créer qu'une seule instance côté client
  const notyfRef = useRef();

  if (!notyfRef.current && typeof window !== "undefined") {
    notyfRef.current = new Notyf({
      duration: 5000,
      position: { x: "center", y: "bottom" },
      dismissible: true,
      ripple: true,
      types: [
        {
          type: "success",
          background: "#4caf50",
          icon: false,
        },
        {
          type: "error",
          background: "#f44336",
          icon: false,
        },
        {
          type: "info",
          background: "#2196f3",
          icon: false,
        },
        {
          type: "warning",
          background: "#ff9800",
          icon: false,
        },
      ],
      // ajoutes d'autres config si besoin
    });
  }

  return (
    <NotyfContext.Provider value={notyfRef.current}>
      {children}
    </NotyfContext.Provider>
  );
}

export const useNotyf = () => useContext(NotyfContext);
