/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_WAREHOUSE_API_URL: process.env.NEXT_PUBLIC_WAREHOUSE_API_URL,
    NEXT_PUBLIC_ORDER_API_URL: process.env.NEXT_PUBLIC_ORDER_API_URL,
    NEXT_PUBLIC_PRODUCT_API_URL: process.env.NEXT_PUBLIC_PRODUCT_API_URL,
    NEXT_PUBLIC_USER_API_URL: process.env.NEXT_PUBLIC_USER_API_URL,
  },
};

export default nextConfig;
