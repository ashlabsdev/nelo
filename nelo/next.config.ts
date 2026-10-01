import type {
  NextConfig,
} from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  images: { remotePatterns: [ { protocol: "https", hostname: "rlohyiqszzvsbwpxvtql.supabase.co", pathname: "/storage/v1/object/public/post-media/**", }, ],
  },
};

export default nextConfig;
