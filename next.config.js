/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

if (process.env.NODE_ENV === "production") {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  });
}

module.exports = {
  poweredByHeader: false,
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.netlify.app",
        "*.gitlink.app",
        "*.google.com",
        "*.googleusercontent.com",
        "*.binusgat.com",
      ],
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
