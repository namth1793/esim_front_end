import EsimCard from "@/components/EsimCard";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EsimAccessPackage, useEsimPackages } from "@/hooks/useApi";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

// Derive display region from eSIM Access location string (e.g. "VN,TH,JP" or "US,CA")
const getRegionFromLocation = (location: string): string => {
  if (!location) return "Global";
  const locs = location.split(",").map(s => s.trim().toUpperCase());
  if (locs.length > 5) return "Global";
  if (locs.length > 1) return "Regional";
  return "Local";
};

// Country code → display name (top entries)
const countryMap: Record<string, string> = {
  VN: "Vietnam", TH: "Thailand", JP: "Japan", KR: "South Korea",
  US: "USA", CA: "Canada", GB: "United Kingdom", FR: "France",
  DE: "Germany", SG: "Singapore", MY: "Malaysia", ID: "Indonesia",
  PH: "Philippines", TW: "Taiwan", HK: "Hong Kong", AU: "Australia",
  NZ: "New Zealand", IN: "India", CN: "China", IT: "Italy",
  ES: "Spain", PT: "Portugal", NL: "Netherlands", BE: "Belgium",
  ZA: "South Africa", EG: "Egypt", AE: "UAE", SA: "Saudi Arabia",
  MX: "Mexico", BR: "Brazil", AR: "Argentina",
};

const getCountryName = (location: string): string => {
  if (!location) return "International";
  const codes = location.split(",").map(s => s.trim().toUpperCase());
  if (codes.length === 1) return countryMap[codes[0]] || codes[0];
  return codes.map(c => countryMap[c] || c).join(", ");
};

// Transform eSIM Access package → EsimProduct shape that EsimCard expects
const transformPackage = (pkg: EsimAccessPackage) => ({
  id: pkg.packageCode,
  name: pkg.name,
  country: getCountryName(pkg.location),
  region: getRegionFromLocation(pkg.location),
  dataAmount: pkg.dataAmount,
  validity: `${pkg.duration} ${pkg.durationUnit}${pkg.duration > 1 ? "s" : ""}`,
  price: pkg.price,
  originalPrice: pkg.retailPrice > pkg.price ? pkg.retailPrice : undefined,
  coverage: pkg.location.split(",").map(c => countryMap[c.trim()] || c.trim()),
  image: `https://placehold.co/400x300/16a34a/ffffff?text=${encodeURIComponent(getCountryName(pkg.location))}`,
  description: `${pkg.dataAmount} data · ${pkg.duration} ${pkg.durationUnit}(s) · ${getCountryName(pkg.location)}`,
});

// Region filters
const regionFilters = ["All", "Local", "Regional", "Global"];

const EsimListing = () => {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: rawPackages = [], isLoading } = useEsimPackages();

  // Transform + memoize
  const products = useMemo(() => rawPackages.map(transformPackage), [rawPackages]);

  const filtered = useMemo(() => {
    return products.filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        e.country?.toLowerCase().includes(q) ||
        e.name?.toLowerCase().includes(q);

      const matchesRegion =
        regionFilter === "All" || e.region === regionFilter;

      return matchesSearch && matchesRegion;
    });
  }, [search, regionFilter, products]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  const handleFilterChange = (newRegion: string, newSearch: string) => {
    setRegionFilter(newRegion);
    setSearch(newSearch);
    setCurrentPage(1);
  };

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
                onChange={(e) => handleFilterChange(regionFilter, e.target.value)}
                placeholder="Search by country or plan name..."
                className="bg-primary-foreground/95 pl-10 border-0 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-8">
        <div className="container">
          {/* Region Filters - ĐƯA VÀO GIỮA MÀN HÌNH */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex flex-wrap gap-2 p-1 bg-secondary/30 rounded-full">
              {regionFilters.map((r) => (
                <button
                  key={r}
                  onClick={() => handleFilterChange(r, search)}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                    regionFilter === r
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length} plan{filtered.length !== 1 ? "s" : ""} found
            </p>
            {!isLoading && filtered.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
              </p>
            )}
          </div>

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
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedProducts.map((esim, i) => (
                  <EsimCard
                    key={esim.id}
                    esim={esim}
                    index={i}
                    linkState={{ esimPackage: rawPackages[rawPackages.findIndex(p => p.packageCode === esim.id)] }}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/10"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/10"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default EsimListing;