/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow dev server access from other devices on your network (e.g. phone/tablet at 192.168.x.x)
  allowedDevOrigins: ["http://192.168.29.66:3000", "http://localhost:3000"],
};

module.exports = nextConfig;
