import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },

  async rewrites() {
    const AUTH_URL  = "https://breezy-dad-6.onrender.com";
    const USER_URL  = "https://user-service-82ui.onrender.com";
    const POST_URL  = "https://post-service-tmsc.onrender.com";
    const MSG_URL   = "https://message-service-cpmd.onrender.com";
    const NOTIF_URL = "https://notification-service-mrpo.onrender.com";

    return [
      // AUTH SERVICE
      { source: "/api/auth/:path*", destination: `${AUTH_URL}/api/auth/:path*` },

      // USER SERVICE
      { source: "/api/users/:path*", destination: `${USER_URL}/api/users/:path*` },
      { source: "/api/friend-requests/:path*", destination: `${USER_URL}/api/friend-requests/:path*` },
      { source: "/api/admin/:path*", destination: `${USER_URL}/api/admin/:path*` },

      // POST SERVICE
      { source: "/api/posts/:path*", destination: `${POST_URL}/api/posts/:path*` },
      { source: "/api/comments/:path*", destination: `${POST_URL}/api/comments/:path*` },
      { source: "/api/likes/:path*", destination: `${POST_URL}/api/likes/:path*` },
      { source: "/api/admin/posts/:path*", destination: `${POST_URL}/api/admin/:path*` },
      { source: "/api/uploads/:path*", destination: `${POST_URL}/api/uploads/:path*` },

      // MESSAGE SERVICE
      { source: "/api/messages/:path*", destination: `${MSG_URL}/api/messages/:path*` },

      // NOTIFICATION SERVICE
      { source: "/api/notifications/:path*", destination: `${NOTIF_URL}/api/notifications/:path*` },

      // Health / Warmup (optionnel)
      { source: "/health", destination: `${AUTH_URL}/health` },
      { source: "/warmup", destination: `${AUTH_URL}/warmup` },
    ];
  },
};

export default withNextIntl(nextConfig);
