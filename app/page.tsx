import { Hero } from '@/components/marketing/Hero';
import {
  CtaBand,
  GlobalSection,
  HowItWorks,
  NetworkMarquee,
  Services,
  WhyUs } from "@/components/marketing/StaticSections";
import { FaqPreview, LatestPosts, PlansShowcase } from "@/components/marketing/DataSections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <NetworkMarquee />
      <Services />
      <HowItWorks />
      <PlansShowcase />
      <WhyUs />
      <GlobalSection />
      <LatestPosts />
      <FaqPreview />
      <CtaBand />
    </>
  );
}