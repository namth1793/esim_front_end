import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import EsimCard from "@/components/EsimCard";
import { regions, dataFilters } from "@/data/mockEsims";
import { useProducts } from "@/hooks/useApi";
import { motion } from "framer-motion";

const EsimListing = () => {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [dataFilter, setDataFilter] = useState("All");
  const { data: products = [], isLoading } = useProducts();

  const filtered = useMemo(() => {
    return products.filter((e) => {
      const matchesSearch =
        e.country.toLowerCase().includes(search.toLowerCase()) ||
        e.name.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = regionFilter === "All" || e.region === regionFilter;
      const matchesData = dataFilter === "All" || e.dataAmount === dataFilter;
      return matchesSearch && matchesRegion && matchesData;
    });
  }, [search, regionFilter, dataFilter]);

  return (
    <Layout>
      <section className="bg-gradient-hero py-12 md:py-16">
        <div className="container text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 font-display text-3xl font-bold text-primary-foreground md:text-4xl"
          >
            Browse eSIM Plans
          </motion.h1>
          <p className="mb-8 text-primary-foreground/70">
            Find the perfect data plan for your next destination.
          </p>

          <div className="mx-auto max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by country..."
                className="bg-primary-foreground/95 pl-10 border-0 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container">
          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Region</p>
              <div className="flex flex-wrap gap-2">
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegionFilter(r)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      regionFilter === r
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Data</p>
              <div className="flex flex-wrap gap-2">
                {dataFilters.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDataFilter(d)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      dataFilter === d
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <p className="mb-4 text-sm text-muted-foreground">
            {filtered.length} plan{filtered.length !== 1 ? "s" : ""} found
          </p>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No plans found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((esim, i) => (
                <EsimCard key={esim.id} esim={esim} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default EsimListing;
