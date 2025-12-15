import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fleet Cost Tracker",
    short_name: "Fleet Tracker",
    description: "Modern collaborative financial modeling platform for equipment/fleet cost tracking",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["finance", "business", "productivity"],
    shortcuts: [
      {
        name: "Projects",
        short_name: "Projects",
        description: "View all projects",
        url: "/dashboard/projects",
        icons: [{ src: "/icon-192.png", "sizes": "192x192" }],
      },
      {
        name: "Reports",
        short_name: "Reports",
        description: "View reports",
        url: "/dashboard/reports",
        icons: [{ src: "/icon-192.png", "sizes": "192x192" }],
      },
    ],
  }
}
