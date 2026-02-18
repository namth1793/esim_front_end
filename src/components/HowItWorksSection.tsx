import { motion } from "framer-motion";
import { Search, CreditCard, QrCode, Wifi } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "1",
    title: "Choose Your Plan",
    description: "Browse eSIMs by country or region. Pick the data amount and validity that suits your trip.",
  },
  {
    icon: CreditCard,
    step: "2",
    title: "Purchase & Pay",
    description: "Checkout securely with Amazon Pay. No hidden fees — pay once and you're set.",
  },
  {
    icon: QrCode,
    step: "3",
    title: "Install Your eSIM",
    description: "Scan the QR code or enter details manually. It takes less than 2 minutes.",
  },
  {
    icon: Wifi,
    step: "4",
    title: "Connect & Go",
    description: "Activate your eSIM when you arrive. Enjoy fast, reliable data instantly.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-muted-foreground">
            Get connected in 4 simple steps — no store visits, no physical SIM cards.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.4 }}
              className="relative rounded-xl border border-border bg-card p-6 text-center shadow-card"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-cta text-primary-foreground font-display text-xl font-bold">
                {item.step}
              </div>
              <item.icon className="mx-auto mb-3 h-6 w-6 text-primary" />
              <h3 className="mb-2 font-display font-semibold text-card-foreground">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
