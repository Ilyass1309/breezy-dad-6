"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/authcontext";
import { fetchUserFeed, fetchFYP } from "@/utils/api";
import Feed from "@/components/Feed";
import RightSidebar from "@/components/RightSidebar";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const { accessToken } = useAuth();
  const t = useTranslations("homepage");
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [forYouPosts, setFYP] = useState([]);
  const [loadingFYP, setLoadingFYP] = useState(true);
  const [selectedTab, setSelectedTab] = useState("forYou"); // 'home' ou 'profile'

  useEffect(() => {
    async function loadPosts() {
      setLoadingPosts(true);
      setLoadingFYP(true);
      try {
        const userFYP = await fetchFYP(accessToken);
        setFYP(userFYP || []);
        const userPosts = await fetchUserFeed(accessToken);
        setPosts(userPosts || []);
      } catch {
        setPosts([]);
        setFYP([]);
      }
      setLoadingPosts(false);
      setLoadingFYP(false);
    }
    loadPosts();
  }, [accessToken]);

  return (
    <main className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar gauche (déjà existante, placeholder ici) */}
        <div className="hidden md:block md:col-span-2"></div>
        {/* Feed principal */}
        <div className="col-span-1 md:col-span-7">
          {/* Onglets */}
          <nav className="tabs tabs-bordered mb-4" role="tablist">
            <button
              role="tab"
              aria-selected={selectedTab === "forYou"}
              className={`tab w-full ${selectedTab === "forYou" ? "tab-active" : ""}`}
              onClick={() => setSelectedTab("forYou")}
            >
              {t("forYou")}
            </button>
            <button
              role="tab"
              aria-selected={selectedTab === "follow"}
              className={`tab w-full ${selectedTab === "follow" ? "tab-active" : ""}`}
              onClick={() => setSelectedTab("follow")}
            >
              {t("follow")}
            </button>
          </nav>
          {/* Contenu de l’onglet Home */}
          {selectedTab === "forYou" && (
            <section role="tabpanel" className="space-y-4">
              <Feed posts={forYouPosts} loadingPosts={loadingFYP} />
            </section>
          )}
          {/* Contenu de l’onglet Profile */}
          {selectedTab === "follow" && (
            <section role="tabpanel" className="space-y-4">
              <Feed posts={posts} loadingPosts={loadingPosts} />
            </section>
          )}
        </div>
        {/* Sidebar droite */}
        <div className="hidden md:block md:col-span-3">
          <RightSidebar />
        </div>
      </div>
    </main>
  );
}
