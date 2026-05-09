import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kids English Trainer",
    short_name: "English Kids",
    description: "Семейный тренажер английского для ребенка",
    start_url: "/login",
    display: "standalone",
    background_color: "#f7fbff",
    theme_color: "#7ed7c1",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }
    ]
  };
}
