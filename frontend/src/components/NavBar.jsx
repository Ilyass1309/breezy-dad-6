"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import AppearanceSettings from "./AppearanceSettings";
import { usePathname } from "next/navigation";

import ProfileCard from "./ProfileCard";
import { useAuth } from "@/contexts/authcontext";
import UserAvatar from "./UserAvatar";
import { fetchUserProfile } from "@/utils/api";
import MenuItem from "./MenuItem";

const ASIDE_WIDTH = 256; // px

export default function NavBar() {
  const { user } = useAuth();
  const t = useTranslations("Navbar");

  const [asideOpen, setAsideOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [dragX, setDragX] = useState(null);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Refs persistantes pour le swipe
  const startY = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(null);

  // Détection mobile (évite le SSR)
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 640);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fermer l'aside (avec délai pour l'animation overlay)
  const handleAsideClose = () => {
    setTimeout(() => setAsideOpen(false), 300);
  };

  // Gestion du swipe pour ouvrir/fermer l'aside sur mobile
  useEffect(() => {
    if (!isMobile) return;
    let dynamicResistance = 100;
    const resistance = 100;
    const horizontalThreshold = 2;
    function handleTouchStart(e) {
      setTouchStartX(e.touches[0].clientX);
      startY.current = e.touches[0].clientY;
      setDragX(null);
      isDragging.current = false;
      dragStartX.current = null;
      // Calcule la résistance selon la position de départ (plus à gauche = moins résistant)
      const minRes = 30;
      const maxRes = 150;
      const screenWidth = window.innerWidth;
      const ratio = Math.min(
        1,
        Math.max(0, e.touches[0].clientX / (screenWidth * 0.7))
      );
      dynamicResistance = minRes + (maxRes - minRes) * ratio;
    }
    function handleTouchMove(e) {
      if (touchStartX !== null && startY.current !== null) {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - touchStartX;
        const deltaY = currentY - startY.current;
        if (!asideOpen) {
          if (!isDragging.current) {
            if (Math.abs(deltaY) < 10) return;
            if (Math.abs(deltaX) / Math.abs(deltaY) < horizontalThreshold)
              return;
            isDragging.current = true;
            dragStartX.current = currentX; // On mémorise la position du doigt au début du drag
          }
        } else {
          isDragging.current = true;
          if (dragStartX.current === null) dragStartX.current = currentX;
        }
        if (isDragging.current) {
          let delta = currentX - dragStartX.current;
          if (!asideOpen) {
            delta = Math.max(0, Math.min(delta, ASIDE_WIDTH));
          }
          if (asideOpen) {
            delta = Math.min(0, Math.max(delta, -ASIDE_WIDTH));
          }
          setDragX(delta);
          setTouchEndX(currentX);
        }
      }
    }
    function handleTouchEnd() {
      if (touchStartX !== null && touchEndX !== null && isDragging.current) {
        const deltaX = touchEndX - dragStartX.current;
        if (!asideOpen && deltaX > dynamicResistance) setAsideOpen(true);
        else if (asideOpen && deltaX < -100) setAsideOpen(false);
      }
      setTouchStartX(null);
      setTouchEndX(null);
      setDragX(null);
      startY.current = null;
      isDragging.current = false;
      dragStartX.current = null;
    }
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [asideOpen, touchStartX, touchEndX, isMobile]);

  // Style dynamique pour l'aside (mobile uniquement)
  const asideStyle = isMobile
    ? {
        zIndex: 60,
        transition: dragX === null ? "transform 0.3s" : "none",
        transform:
          dragX !== null
            ? `translateX(${asideOpen ? dragX : -ASIDE_WIDTH + dragX}px)`
            : asideOpen
            ? "translateX(0)"
            : `translateX(-${ASIDE_WIDTH}px)`,
      }
    : { zIndex: 60 };

  // Overlay dynamique
  let openProgress = 0;
  if (dragX !== null) {
    openProgress = asideOpen ? 1 + dragX / ASIDE_WIDTH : dragX / ASIDE_WIDTH;
    openProgress = Math.max(0, Math.min(openProgress, 1));
  } else {
    openProgress = asideOpen ? 1 : 0;
  }
  const overlayOpacity = 0.4 * openProgress;

  // Navbar mobile hide/show on scroll
  useEffect(() => {
    if (!isMobile) return;
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setShowNav(currentY < lastScrollY || currentY < 10);
          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY, isMobile]);

  return (
    <>
      {/* Aside latérale */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full w-64 bg-base-100 shadow-lg z-60",
          "transition-transform duration-300",
          "sm:translate-x-0"
        )}
        style={asideStyle}
      >
        <div className="flex flex-col h-full">
          {/* User */}
          <div className="flex items-center justify-between p-4 border-b">
            <ProfileCard user={user} />
          </div>
          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-4 flex flex-col">
            <ul className="menu menu-horizontal gap-2 p-0 text-base rtl:ml-20 w-full">
              <MenuItem
                label={t("home")}
                href="/home"
                icon="home"
                iconFillable={true}
                pathname={pathname}
                showOnMobile={false}
              />

              <MenuItem
                label={t("profile")}
                href={`/profile/${user?.username}`}
                icon="user"
                iconFillable={true}
                pathname={pathname}
              />
              <MenuItem
                label={t("search")}
                href="/search"
                icon="search"
                iconFillable={false}
                pathname={pathname}
                showOnMobile={false}
              />
              <MenuItem
                label={t("breeze")}
                href="/breeze"
                icon="wind"
                iconFillable={false}
                pathname={pathname}
                showOnMobile={false}
                showOnDesktop={false}
              />
              <MenuItem
                label={t("notifications")}
                href="/notifications"
                icon="bell"
                iconFillable={true}
                pathname={pathname}
                showOnMobile={false}
              />
              <MenuItem
                label={t("messages")}
                href="/messages"
                icon="message"
                iconFillable={true}
                pathname={pathname}
                showOnMobile={false}
              />
              <MenuItem
                label={t("bookmarks")}
                href="#"
                icon="bookmark"
                iconFillable={true}
                pathname={pathname}
              />
            </ul>
            {/* Add a button fixed at the bottom of the nav */}
            <div className="flex-1" />
            {/* Button fixed at the bottom of the nav */}
            <div className="mb-2 hidden sm:block">
              <Link
                href="/breeze"
                className="btn btn-primary w-full justify-center"
              >
                <span className="icon-[tabler--wind] size-6" />
                <span>{t("breeze")}</span>
              </Link>
            </div>
          </nav>
          {/* Sélecteurs thème/langue */}
          <div className="flex flex-col gap-4 p-4 border-t">
            <div className="flex justify-around p-4 w-full flex-wrap gap-4">
              <AppearanceSettings />
            </div>
            <div className="flex justify-center">
              <button
                className="btn btn-text w-full"
                onClick={useAuth().logout}
              >
                <span className="icon-[tabler--logout-2] size-6" />
                <span>{t("logout")}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Navbar mobile (haut) */}
      <nav
        className={clsx(
          "navbar shadow sm:hidden fixed top-0 left-0 right-0 z-30 bg-base-100 transition-transform duration-300",
          showNav ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="flex w-full items-center justify-between">
          <button
            onClick={() => setAsideOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <UserAvatar user={user} size="sm" link={false} />
          </button>
          <Link className="ml-2 text-xl font-semibold no-underline" href="/">
            {t("title")}
          </Link>
        </div>
        {/* Tu peux ajouter ici les sélecteurs thème/langue si tu veux accès rapide sur mobile */}
      </nav>

      {/* Navbar mobile (bas) */}
      <nav
        className={clsx(
          "navbar shadow sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-base-100 border-t transition-transform duration-300",
          showNav ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex w-full justify-around">
          <Link
            href="/home"
            className="btn btn-text flex-1 flex flex-col items-center"
          >
            <span
              className={clsx(
                "size-6",
                pathname == "/home"
                  ? "text-primary icon-[tabler--home-filled]"
                  : "icon-[tabler--home]"
              )}
            ></span>
          </Link>
          <Link
            href="/search"
            className="btn btn-text flex-1 flex flex-col items-center"
          >
            <span
              className={clsx(
                "icon-[tabler--search] size-6",
                pathname === "/search" && "text-primary"
              )}
            ></span>
          </Link>
          <Link
            href="/breeze"
            className="btn btn-text flex-1 flex flex-col items-center"
          >
            <span
              className={clsx(
                "icon-[tabler--wind] size-6",
                pathname === "/breeze" && "text-primary"
              )}
            ></span>
          </Link>
          <Link
            href="/notifications"
            className="btn btn-text flex-1 flex flex-col items-center"
          >
            <span
              className={clsx(
                "size-6",
                pathname == "/notifications"
                  ? "text-primary icon-[tabler--bell-filled]"
                  : "icon-[tabler--bell]"
              )}
            ></span>
          </Link>
          <Link
            href="/messages"
            className="btn btn-text flex-1 flex flex-col items-center"
          >
            <span
              className={clsx(
                "size-6",
                pathname == "/messages"
                  ? "text-primary icon-[tabler--message-filled]"
                  : "icon-[tabler--message]"
              )}
            ></span>
          </Link>
        </div>
      </nav>

      {/* Overlay pour fermer l'aside sur mobile */}
      {(asideOpen || dragX !== null) && (
        <div
          className="fixed inset-0 bg-black z-50 sm:hidden"
          style={{
            opacity: overlayOpacity,
            transition: dragX === null ? "opacity 0.3s" : "none",
            pointerEvents: overlayOpacity > 0.05 ? "auto" : "none",
          }}
          onPointerUp={handleAsideClose}
          aria-label="Fermer le menu"
        />
      )}
    </>
  );
}
