"use client";

import NavBar from "../../components/NavBar";
import { useAuth } from "@/contexts/authcontext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({ left, center, right }) {
  const { accessToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!accessToken) {
      router.replace(`/?from=${encodeURIComponent(pathname)}`);
    }
  }, [accessToken, router, pathname]);

  if (!accessToken) return null;

  return (
    <>
      <NavBar />
      <div className="pt-16 w-full">
        <div
          className="mx-auto w-full max-w-[1280px] gap-6 px-4 sm:px-6 lg:px-8 grid xl:grid-cols-[260px_minmax(0,1fr)_260px]"
        >
          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block sticky top-20 h-fit">{left}</aside>
          {/* FEED (center) */}
          <main className="min-w-0">{center}</main>
          {/* RIGHT SIDEBAR */}
          <aside className="hidden xl:block sticky top-20 h-fit pl-6 border-l border-neutral-200/70 dark:border-neutral-800">{right}</aside>
        </div>
      </div>
    </>
  );
}
