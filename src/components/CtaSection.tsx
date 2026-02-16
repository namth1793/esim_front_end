import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CtaSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="rounded-2xl bg-gradient-ocean p-10 text-center md:p-16">
          <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to Stay Connected?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
            Browse our eSIM plans and get instant data access in 200+ countries. No contracts, no hidden fees.
          </p>
          <Button
            size="lg"
            className="bg-primary-foreground text-ocean-dark font-semibold hover:bg-primary-foreground/90 px-8"
            asChild
          >
            <Link to="/esims">
              Get Your eSIM Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
