"use client";
import NavBar from "@/components/NavBar";

export default function MainLayout({ children }) {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex">
          {/* Left sidebar: NavBar */}
          <div className="hidden sm:block flex-shrink-0 w-80">
            <NavBar />
          </div>
          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
