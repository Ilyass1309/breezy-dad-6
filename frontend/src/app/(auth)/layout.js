"use client";
import AppearanceSettings from "@/components/AppearanceSettings";
import { useAuth } from "@/contexts/authcontext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }) {
  const { accessToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (accessToken) {
      router.push(searchParams.get("from") || "/home"); // Redirige vers la page principale si déjà connecté
    }
  }, [accessToken, router]);

  if (accessToken) return null; // Optionnel : évite le flash de contenu

  return (
    <div>
      <header className="fixed w-full z-50 p-4 flex justify-end flex-wrap gap-2">
        <AppearanceSettings />
      </header>
      {children}
    </div>
  );
}
