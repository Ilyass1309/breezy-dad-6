"use client";
import { useRouter } from "next/navigation";

export default function UserAvatar({ user, size = "md", link = true }) {
  const router = useRouter();
  const sizes = {
    xs: "h-8 w-8",
    sm: "h-10 w-10",
    gs: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-32 w-32",
  };
  const initials = user?.username
    ? user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";
  return (
    <>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.username || "Avatar"}
          className={`${sizes[size]} shrink-0 rounded-full object-cover`}
          onClick={
            link ? () => router.push(`/profile/${user.username}`) : undefined
          }
          style={link ? { cursor: "pointer" } : undefined}
        />
      ) : (
        <div
          className={`bg-neutral text-neutral-content ${sizes[size]} shrink-0 rounded-full flex items-center justify-center`}
          onClick={
            link ? () => router.push(`/profile/${user.username}`) : undefined
          }
          style={link ? { cursor: "pointer" } : undefined}
        >
          <span className="text-xl uppercase">{initials}</span>
        </div>
      )}
    </>
  );
}
