import { motion } from "framer-motion";
import { CreditCard, Globe, Smartphone, Zap } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Buy and activate your eSIM in under 5 minutes. No waiting for physical cards.",
  },
  {
    icon: Globe,
    title: "200+ Destinations",
    description: "Travel data plans covering countries and regions worldwide.",
  },
  {
    icon: CreditCard,
    title: "Affordable Plans",
    description: "Save up to 90% compared to traditional roaming charges.",
  },
  {
    icon: Smartphone,
    title: "Easy Installation",
    description: "Scan a QR code or enter details manually. Works on all eSIM-compatible devices.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
            Why Choose <span className="text-primary">STOAHUB</span>?
          </h2>
          <p className="text-muted-foreground">
            The simplest way to stay connected while traveling abroad.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="rounded-xl border border-border bg-card p-6 text-center shadow-card transition-all hover:shadow-card-hover"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-display font-semibold text-card-foreground">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
