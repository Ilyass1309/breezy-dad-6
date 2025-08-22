import React from "react";
import Link from "next/link";

const trending = ["fun", "image", "music", "coding", "travel"];
const suggestions = [
  {
    username: "alice",
    avatar: "/public/globe.svg",
  },
  {
    username: "bob",
    avatar: "/public/next.svg",
  },
  {
    username: "charlie",
    avatar: "/public/vercel.svg",
  },
  {
    username: "daisy",
    avatar: "/public/window.svg",
  },
];

export default function RightSidebar() {
  return (
    <aside className="hidden md:block">
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h2 className="font-bold text-lg mb-3">Trending</h2>
        <ul className="space-y-2">
          {trending.map((tag) => (
            <li key={tag}>
              <Link
                href={`/search?q=%23${tag}`}
                className="text-accent hover:underline font-medium"
              >
                #{tag}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4">
        <h2 className="font-bold text-lg mb-3">Who to follow</h2>
        <ul className="space-y-4">
          {suggestions.map((user) => (
            <li key={user.username} className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-10 h-10 rounded-full border"
              />
              <span className="font-semibold">{user.username}</span>
              <button className="ml-auto bg-violet-500 hover:bg-violet-600 text-white text-xs rounded-full px-4 py-1 font-semibold transition">
                Follow
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
