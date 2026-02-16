import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import FeaturedPackages from "@/components/FeaturedPackages";
import CtaSection from "@/components/CtaSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <BenefitsSection />
      <FeaturedPackages />
      <CtaSection />
    </Layout>
  );
};

export default Index;
