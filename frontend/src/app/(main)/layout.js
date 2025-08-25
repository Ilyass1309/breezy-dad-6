"use client";
import NavBar from "../../components/NavBar";
import { useAuth } from "@/contexts/authcontext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({ children }) {
  const { accessToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!accessToken) {
      router.replace(`/?from=${encodeURIComponent(pathname)}`);
    }
  }, [accessToken, router, pathname]);

  if (!accessToken) return null; // Optionnel : évite le flash de contenu

  return (
    <>
      {/* NavBar latérale fixe, étroite */}
      <div className="fixed top-0 left-0 h-full w-14 z-50 bg-base-100 border-r border-base-200 hidden sm:block">
        <NavBar />
      </div>
      {/* Contenu principal avec margin-left pour ne pas passer sous la NavBar */}
      <div className="sm:ml-14">
        {children}
      </div>
    </>
  );
}