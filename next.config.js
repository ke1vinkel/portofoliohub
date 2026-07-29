module.exports = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.gitlink.app", "*.google.com", "*.googleusercontent.com"],
    },
  }
};

