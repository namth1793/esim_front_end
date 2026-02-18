import { Link } from "react-router-dom";
import { ArrowRight, Globe, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-85" />
      </div>

      <div className="container relative z-10 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground/90 backdrop-blur-sm">
              <Globe className="h-4 w-4" />
              200+ Countries Covered
            </div>
            <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-primary-foreground md:text-6xl md:leading-tight">
              Stay Connected{" "}
              <span className="text-teal-light">Everywhere</span>{" "}
              You Travel
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/80 md:text-xl">
              Instant eSIM activation. No physical SIM needed. Buy, install, and connect in minutes — from anywhere in the world.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              className="bg-primary-foreground text-ocean-dark font-semibold hover:bg-primary-foreground/90 shadow-lg px-8"
              asChild
            >
              <Link to="/esims">
                Browse eSIMs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              How It Works
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-primary-foreground/70"
          >
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              Secure Payment
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4" />
              Instant Activation
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" />
              Global Coverage
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
