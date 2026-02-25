import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

interface EsimCardProps {
  esim: {
    id: string;
    name: string;
    country: string;
    region: string;
    dataAmount: string;
    validity: string;
    price: number | string;
    originalPrice?: number | string;
    coverage: string[];
    image: string;
    description: string;
    // Categories từ API - mảng các object có id, name, slug
    categories?: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
  };
  index: number;
  linkState?: any; // optional React Router state passed on navigation
}

const EsimCard = ({ esim, index, linkState }: EsimCardProps) => {
  // Helper function để format price an toàn
  const formatPrice = (price: number | string | undefined): number => {
    if (price === undefined || price === null) return 0;
    const parsed = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(parsed) ? 0 : parsed;
  };

  const currentPrice = formatPrice(esim.price);
  const originalPrice = formatPrice(esim.originalPrice);
  
  const discount = originalPrice > currentPrice 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Lấy danh sách category names từ categories API
  const categoryNames = esim.categories?.map(cat => cat.name) || [];
  
  // Helper để lấy category hiển thị (ưu tiên category không phải "Regional")
  const getDisplayCategory = (): string => {
    if (!esim.categories || esim.categories.length === 0) {
      return esim.region || 'Global';
    }
    
    // Tìm category không phải "Regional" để hiển thị
    const nonRegionalCategory = esim.categories.find(cat => 
      cat.name !== 'Regional' && cat.name !== 'Global' && cat.name !== 'Uncategorized'
    );
    
    return nonRegionalCategory?.name || esim.categories[0]?.name || esim.region || 'Global';
  };

  // Helper để lấy màu sắc cho từng category dựa trên slug hoặc name
  const getCategoryColor = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('asia')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    if (name.includes('europe')) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    if (name.includes('america')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
    if (name.includes('africa')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
    if (name.includes('oceania')) return 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300';
    if (name.includes('global')) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
    if (name.includes('regional')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
    
    return 'bg-secondary text-secondary-foreground';
  };

  const displayCategory = getDisplayCategory();
  const categoryColor = getCategoryColor(displayCategory);

  // Đảm bảo các trường khác có giá trị mặc định
  const safeEsim = {
    id: esim.id || 'unknown',
    name: esim.name || 'eSIM Plan',
    country: esim.country || 'International',
    region: esim.region || 'Global',
    dataAmount: esim.dataAmount || '1GB',
    validity: esim.validity || '30 days',
    price: currentPrice,
    originalPrice: discount > 0 ? originalPrice : undefined,
    coverage: Array.isArray(esim.coverage) ? esim.coverage : [esim.country || 'International'],
    image: esim.image || 'https://placehold.co/400x300?text=eSIM',
    description: esim.description || `Perfect eSIM plan for your travels`,
    categories: esim.categories || []
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-lg"
    >
      <Link to={`/product/${safeEsim.id}`} state={linkState}>
        <div className="relative mb-4 overflow-hidden rounded-lg bg-muted">
          <img
            src={safeEsim.image}
            alt={safeEsim.country}
            className="h-40 w-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              // Fallback nếu image load lỗi
              (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=eSIM';
            }}
          />
          {discount > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}
          
          {/* Hiển thị category badges trên góc phải ảnh */}
          {esim.categories && esim.categories.length > 0 && (
            <div className="absolute right-2 top-2 flex flex-wrap gap-1 justify-end">
              {esim.categories.slice(0, 2).map((cat, idx) => (
                <span
                  key={cat.id || idx}
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(cat.name)}`}
                >
                  {cat.name}
                </span>
              ))}
              {esim.categories.length > 2 && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  +{esim.categories.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground line-clamp-1">{safeEsim.name}</h3>
            {/* Hiển thị category chính thay vì region */}
          </div>
          
          {/* Hiển thị tất cả categories dạng text nhỏ (nếu có nhiều hơn 1) */}
          {esim.categories && esim.categories.length > 1 && (
            <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <span className="font-medium">Categories:</span>
              <div className="flex flex-wrap gap-1">
                {esim.categories.map((cat, idx) => (
                  <span 
                    key={cat.id || idx}
                    className="inline-flex items-center px-1.5 py-0.5 bg-secondary/50 rounded"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-primary" />
              {safeEsim.price > 0 ? (
                <>
                  <span className="font-display text-lg font-bold text-foreground">
                    ${safeEsim.price.toFixed(2)}
                  </span>
                  {safeEsim.originalPrice && safeEsim.originalPrice > safeEsim.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${safeEsim.originalPrice.toFixed(2)}
                    </span>
                  )}
                </>
              ) : (
                <span className="font-display text-sm font-semibold text-primary">See plans</span>
              )}
            </div>
            <span className="text-xs font-medium text-primary hover:underline">View details →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EsimCard;