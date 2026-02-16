import { Link } from "react-router-dom";
import { Wifi, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { EsimPackage } from "@/data/mockEsims";

interface EsimCardProps {
  esim: EsimPackage;
  index?: number;
}

const EsimCard = ({ esim, index = 0 }: EsimCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        to={`/esim/${esim.id}`}
        className="group block rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{esim.flagEmoji}</span>
            <div>
              <h3 className="font-display font-semibold text-card-foreground leading-tight">
                {esim.country}
              </h3>
              <p className="text-xs text-muted-foreground">{esim.region}</p>
            </div>
          </div>
          {esim.popular && (
            <Badge className="bg-coral/10 text-coral border-coral/20 text-xs">
              Popular
            </Badge>
          )}
        </div>

        <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Wifi className="h-3.5 w-3.5" />
            {esim.dataAmount}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {esim.validity}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" />
            {esim.speed}
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-display font-bold text-foreground">
              ${esim.price.toFixed(2)}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">USD</span>
          </div>
          <Button
            size="sm"
            className="bg-gradient-cta text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            tabIndex={-1}
          >
            View Details
          </Button>
        </div>
      </Link>
    </motion.div>
  );
};

export default EsimCard;
