import HeroBanner from '@/components/HeroBanner';
import PopularServices from '@/components/PopularServices';
import ValueProposition from '@/components/ValueProposition';
import ExploreMarketplace from '@/components/ExploreMarketplace';
import ConsulSpherePro from '@/components/ConsulSpherePro';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import GuidesResources from '@/components/GuidesResources';
import CallToAction from '@/components/CallToAction';

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Banner with live search, tags & category mosaic */}
      <HeroBanner />

      {/* 2. Popular professional services carousel (Fiverr style) */}
      <PopularServices />

      {/* 3. Value Proposition: A whole world of freelance talent at your fingertips */}
      <ValueProposition />

      {/* 4. Explore the marketplace (10-category visual grid) */}
      <ExploreMarketplace />

      {/* 5. ConsulSphere Pro (Fiverr Pro enterprise solution) */}
      <ConsulSpherePro />

      {/* 6. How ConsulSphere works (4-step ordering & escrow process) */}
      <HowItWorks />

      {/* 7. Client Testimonials & Success Stories */}
      <Testimonials />

      {/* 8. ConsulSphere Guides & Growth Resources */}
      <GuidesResources />

      {/* 9. Bottom Hero Call to Action */}
      <CallToAction />
    </div>
  );
}
