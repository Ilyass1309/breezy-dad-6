// app/(main)/layout.jsx
"use client";
import React from "react";

export default function HomeLayout({ left, feed, right }) {
  return (
    <div className="w-full">
      <div
        className="
          mx-auto
          w-full
          max-w-[1280px]
          gap-6
          px-4 sm:px-6 lg:px-8
          grid
          xl:grid-cols-[260px_minmax(0,1fr)_260px]
        "
      >
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block sticky top-20 h-fit">
          {left}
        </aside>

        {/* CENTER FEED (must be centered) */}
        <main className="min-w-0">
          <div className="mx-auto max-w-[700px]">{feed}</div>
        </main>

        {/* RIGHT SIDEBAR with delimiter */}
        <aside className="hidden xl:block sticky top-20 h-fit pl-6 border-l border-neutral-200/70 dark:border-neutral-800">
          {right}
        </aside>
      </div>
    </div>
  );
}
