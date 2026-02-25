import { Button } from "@/components/ui/button";
import { useFeaturedProducts } from "@/hooks/useApi";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import EsimCard from "./EsimCard";

const FeaturedPackages = () => {
  const { data: featured = [], isLoading } = useFeaturedProducts();
  const displayed = featured.slice(0, 4);

  return (
    <section className="py-16 md:py-20 bg-muted/50">
      <div className="container">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
              Popular Destinations
            </h2>
            <p className="text-muted-foreground">
              Top-selling eSIM plans for the most visited countries.
            </p>
          </div>
          <Button variant="ghost" className="text-primary" asChild>
            <Link to="/esims">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
              ))
            : displayed.map((esim, i) => (
                <EsimCard key={esim.id} esim={esim} index={i} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPackages;
