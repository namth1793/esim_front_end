import BenefitsSection from "@/components/BenefitsSection";
import CtaSection from "@/components/CtaSection";
import FeaturedPackages from "@/components/FeaturedPackages";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Layout from "@/components/Layout";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedPackages />
      <BenefitsSection />
      <HowItWorksSection />
      <CtaSection />
    </Layout>
  );
};

export default Index;
