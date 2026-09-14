import { createFileRoute } from "@tanstack/react-router";
import { AyaLanding } from "@/components/landing/AyaLanding";

const TITLE = "AYA — Discover the power of your age";
const DESC =
  "A personalized motivation and self-discovery experience: see what remarkable people were doing at your age, and where your own strengths could lead.";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: AyaLanding,
});
