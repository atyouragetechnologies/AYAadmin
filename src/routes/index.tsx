import { createFileRoute } from "@tanstack/react-router";
import { 
  Hero, 
  Problem, 
  Concept, 
  Relatability, 
  NotJustStories, 
  SelfDiscovery, 
  Idols, 
  Career, 
  Journey, 
  Outcomes, 
  Emotional, 
  Achievements,
  FinalCta 
} from "@/components/landing/AyaLanding";

export const Route = createFileRoute("/")({
  component: () => (
    <>
      <Hero />
      <Problem />
      <Achievements />
      <Idols />
      <Concept />
      <Relatability />
      <NotJustStories />
      <SelfDiscovery />
      <Career />
      <Journey />
      <Outcomes />
      <Emotional />
      <FinalCta />
    </>
  ),
});
