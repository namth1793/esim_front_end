import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Wifi, Clock, Zap, MapPin, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import InstallationGuide from "@/components/InstallationGuide";
import { useProduct } from "@/hooks/useApi";
import { motion } from "framer-motion";

const EsimDetail = () => {
  const { id } = useParams();
  const { data: esim, isLoading } = useProduct(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!esim) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="mb-4 font-display text-2xl font-bold text-foreground">
            eSIM Not Found
          </h1>
          <Button asChild>
            <Link to="/esims">Browse eSIMs</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        <Link
          to="/esims"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to eSIMs
        </Link>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Main info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{esim.flagEmoji}</span>
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                    {esim.name}
                  </h1>
                  <p className="text-muted-foreground">{esim.region}</p>
                </div>
                {esim.popular && (
                  <Badge className="bg-coral/10 text-coral border-coral/20">Popular</Badge>
                )}
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: Wifi, label: "Data", value: esim.dataAmount },
                { icon: Clock, label: "Validity", value: esim.validity },
                { icon: Zap, label: "Speed", value: esim.speed },
                { icon: MapPin, label: "Provider", value: esim.provider },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border bg-card p-4 text-center"
                >
                  <item.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-card-foreground text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Coverage */}
            {esim.coverage.length > 1 && (
              <div>
                <h3 className="mb-3 font-display text-lg font-semibold text-foreground">
                  Coverage ({esim.coverage.length} countries)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {esim.coverage.map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Installation guide */}
            <InstallationGuide />
          </motion.div>

          {/* Purchase card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="font-display text-4xl font-bold text-foreground">
                  ${esim.price.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">USD • One-time payment</p>
              </div>

              <div className="mb-6 space-y-3 rounded-xl bg-muted/50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium text-foreground">{esim.dataAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validity</span>
                  <span className="font-medium text-foreground">{esim.validity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Speed</span>
                  <span className="font-medium text-foreground">{esim.speed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coverage</span>
                  <span className="font-medium text-foreground">
                    {esim.coverage.length === 1 ? esim.country : `${esim.coverage.length} countries`}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-cta text-primary-foreground font-semibold hover:opacity-90"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy Now
              </Button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Instant delivery • No physical SIM required
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default EsimDetail;
