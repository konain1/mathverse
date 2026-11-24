import { FlowSection } from '@/features/landing/FlowSection';
import { Hero } from '@/features/landing/Hero';
import { TopicBrowser } from '@/features/landing/TopicBrowser';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TopicBrowser />
      <FlowSection />
    </>
  );
}
