"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/authcontext";
import { fetchUserFeed, fetchFYP, fetchUsersBulkMinimal } from "@/utils/api";
import Feed from "@/components/Feed";
import RightSidebar from "@/components/RightSidebar";
import { useTranslations } from "next-intl";
import MainLayout from "../layout";

export default function HomePage() {
  const { accessToken } = useAuth();
  const t = useTranslations("homepage");
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [forYouPosts, setFYP] = useState([]);
  const [loadingFYP, setLoadingFYP] = useState(true);
  const [selectedTab, setSelectedTab] = useState("forYou");
  const [authorCache, setAuthorCache] = useState({});

  useEffect(() => {
    async function loadPosts() {
      setLoadingPosts(true);
      setLoadingFYP(true);
      try {
  const userFYP = await fetchFYP(accessToken);
  const fypArr = Array.isArray(userFYP) ? userFYP : [];
  setFYP(fypArr);
  const userPosts = await fetchUserFeed(accessToken);
  const followArr = Array.isArray(userPosts) ? userPosts : [];
  setPosts(followArr);
  // build author cache minimal
  const all = [...fypArr, ...followArr];
  const uniqueIds = [...new Set(all.filter(p=>p && p.author).map(p=>p.author))];
  if (uniqueIds.length) {
    try {
      const minimal = await fetchUsersBulkMinimal(uniqueIds);
      const map = {};
      minimal.forEach(u => { map[u.id] = u; });
      setAuthorCache(map);
    } catch {}
  }
      } catch {
        setPosts([]);
        setFYP([]);
      }
      setLoadingPosts(false);
      setLoadingFYP(false);
    }
    loadPosts();
  }, [accessToken]);

  // Mock data for demo (replace with real data)
  const trending = [
    { tag: "fun", count: 1200 },
    { tag: "image", count: 980 },
    { tag: "music", count: 870 },
    { tag: "coding", count: 650 },
    { tag: "travel", count: 540 },
  ];
  const suggestions = [
    { id: 1, username: "alice", avatar: "/file.svg", bio: "Frontend dev" },
    { id: 2, username: "bob", avatar: "/globe.svg", bio: "Photographer" },
    { id: 3, username: "charlie", avatar: "/vercel.svg", bio: "Music lover" },
  ];

  return (
    <main className="p-6">
      {/* Onglets */}
      <nav className="tabs tabs-bordered mb-4" role="tablist">
        <button
          role="tab"
          aria-selected={selectedTab === "forYou"}
          className={`tab w-full ${
            selectedTab === "forYou" ? "tab-active" : ""
          }`}
          onClick={() => setSelectedTab("forYou")}
        >
          {t("forYou")}
        </button>
        <button
          role="tab"
          aria-selected={selectedTab === "follow"}
          className={`tab w-full ${
            selectedTab === "follow" ? "tab-active" : ""
          }`}
          onClick={() => setSelectedTab("follow")}
        >
          {t("follow")}
        </button>
      </nav>

      {/* Contenu de l’onglet Home */}
      {selectedTab === "forYou" && (
        <section role="tabpanel" className="space-y-4">
          <Feed posts={forYouPosts} loadingPosts={loadingFYP} authorCache={authorCache} />
        </section>
      )}

      {/* Contenu de l’onglet Profile */}
      {selectedTab === "follow" && (
        <section role="tabpanel" className="space-y-4">
          <Feed posts={posts} loadingPosts={loadingPosts} authorCache={authorCache} />
        </section>
      )}
    </main>
  );
}
