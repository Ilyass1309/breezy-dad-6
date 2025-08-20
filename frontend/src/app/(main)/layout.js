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
      <NavBar />
      <div className="flex pt-16 sm:pt-0 transition-all h-full sm:ml-64">
        <div className="w-full h-full">{children}</div>
      </div>
    </>
  );
}
