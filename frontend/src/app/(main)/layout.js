"use client";
import NavBar from "../../components/NavBar";
import { useAuth } from "@/contexts/authcontext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/?from=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, loading, router, pathname]);

  if (loading) return null; // ou un spinner
  if (!isAuthenticated) return null; // redirection en cours

  return (
    <>
      <NavBar />
      <div className="flex pt-16 sm:pt-0 transition-all h-full sm:ml-64">
        <div className="w-full h-full">{children}</div>
      </div>
    </>
  );
}