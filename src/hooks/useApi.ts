import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Replace localhost image URLs — swap with production WordPress URL if available
const WP_URL = import.meta.env.VITE_WORDPRESS_URL || '';
const sanitizeImageUrl = (url: string | undefined | null): string => {
  if (!url) return 'https://placehold.co/400x300?text=eSIM';
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    if (WP_URL) return url.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, WP_URL);
    return 'https://placehold.co/400x300?text=eSIM';
  }
  return url;
};

interface WooCommerceProduct {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  images: Array<{ src: string; alt: string }>;
  attributes: Array<{
    id: number;
    name: string;
    options: string[];
  }>;
  meta_data: Array<{
    key: string;
    value: any;
  }>;
}

export interface EsimProduct {
  id: string;
  name: string;
  country: string;
  region: string;
  dataAmount: string;
  validity: string;
  price: number;
  originalPrice?: number;
  coverage: string[];
  image: string;
  description: string;
}

// Map WooCommerce categories to regions
const categoryToRegion: Record<string, string> = {
  'asia': 'Asia',
  'europe': 'Europe',
  'north-america': 'North America',
  'south-america': 'South America',
  'africa': 'Africa',
  'oceania': 'Oceania',
  'global': 'Global',
  'vietnam': 'Asia',
  'thailand': 'Asia',
  'japan': 'Asia',
  'korea': 'Asia',
  'usa': 'North America',
  'uk': 'Europe',
  'france': 'Europe',
  'germany': 'Europe'
};

// Helper function để parse price an toàn
const safeParsePrice = (price: any): number => {
  if (price === undefined || price === null) return 0;
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper function để đảm bảo array
const safeArray = (arr: any): any[] => {
  return Array.isArray(arr) ? arr : [];
};

// Helper function để đảm bảo string
const safeString = (str: any, defaultValue: string = ''): string => {
  if (str === undefined || str === null) return defaultValue;
  return String(str);
};

// Map data amounts
const extractDataAmountFromProduct = (name: string, attributes: any[]): string => {
  // Try to get from attributes first
  const dataAttr = safeArray(attributes).find(attr => 
    attr.name?.toLowerCase().includes('data') || 
    attr.name?.toLowerCase().includes('dung lượng')
  );
  
  if (dataAttr && dataAttr.options && dataAttr.options[0]) {
    return dataAttr.options[0];
  }
  
  // Extract from name (e.g., "5GB", "10GB", "1GB")
  const match = safeString(name).match(/(\d+)\s*GB/i);
  if (match) {
    return `${match[1]}GB`;
  }
  
  return '1GB';
};

const extractValidityFromProduct = (name: string, attributes: any[]): string => {
  // Try to get from attributes
  const validityAttr = safeArray(attributes).find(attr => 
    attr.name?.toLowerCase().includes('valid') || 
    attr.name?.toLowerCase().includes('ngày') ||
    attr.name?.toLowerCase().includes('day')
  );
  
  if (validityAttr && validityAttr.options && validityAttr.options[0]) {
    return validityAttr.options[0];
  }
  
  // Extract from name (e.g., "30 days", "7 days")
  const match = safeString(name).match(/(\d+)\s*(ngày|days|day)/i);
  if (match) {
    return `${match[1]} days`;
  }
  
  return '30 days';
};

const extractCountry = (name: string, categories: any[]): string => {
  // Try to get from categories first
  const countryCategory = safeArray(categories).find(cat => 
    cat.slug && !['asia', 'europe', 'global', 'esim'].includes(cat.slug.toLowerCase())
  );
  
  if (countryCategory && countryCategory.name) {
    return countryCategory.name;
  }
  
  // Extract from name (e.g., "Vietnam eSIM", "Thailand Travel")
  const match = safeString(name).match(/^([A-Za-z\s]+?)\s+(eSIM|travel|data)/i);
  if (match) {
    return match[1].trim();
  }
  
  return 'International';
};

const extractRegion = (categories: any[]): string => {
  for (const cat of safeArray(categories)) {
    const slug = cat.slug?.toLowerCase();
    if (slug && categoryToRegion[slug]) {
      return categoryToRegion[slug];
    }
  }
  return 'Global';
};

const extractCoverage = (categories: any[]): string[] => {
  return safeArray(categories).map(cat => cat.name || 'Unknown').filter(Boolean);
};

// Trong file useApi.ts, sửa hàm transformWooCommerceProduct

const transformWooCommerceProduct = (product: any): EsimProduct => {
  // Safe extraction with defaults
  const name = safeString(product.name, 'eSIM Plan');
  const categories = safeArray(product.categories); // [{ id, name, slug }]
  const attributes = safeArray(product.attributes);
  const images = safeArray(product.images);
  
  const country = extractCountry(name, categories);
  const region = extractRegion(categories); // Hàm này cần sửa
  const dataAmount = extractDataAmountFromProduct(name, attributes);
  const validity = extractValidityFromProduct(name, attributes);
  const coverage = extractCoverage(categories);
  
  const image = sanitizeImageUrl(images.length > 0 ? images[0].src : null);
  
  const price = safeParsePrice(product.price || product.regular_price);
  const regularPrice = safeParsePrice(product.regular_price);
  const originalPrice = product.sale_price ? regularPrice : undefined;

  // XỬ LÝ CATEGORIES - Lấy đúng từ field categories của API
  const categoryNames = categories.map((cat: any) => cat.name);
  
  // Xác định region dựa trên categories
  let mappedRegion = 'Global';
  if (categoryNames.includes('Asia')) mappedRegion = 'Asia';
  else if (categoryNames.includes('Europe')) mappedRegion = 'Europe';
  else if (categoryNames.includes('North America')) mappedRegion = 'North America';
  else if (categoryNames.includes('South America')) mappedRegion = 'South America';
  else if (categoryNames.includes('Africa')) mappedRegion = 'Africa';
  else if (categoryNames.includes('Oceania')) mappedRegion = 'Oceania';
  else if (categoryNames.includes('Regional')) mappedRegion = 'Regional';
  else if (categoryNames.includes('Global')) mappedRegion = 'Global';

  return {
    id: product.id?.toString() || Math.random().toString(),
    name: name,
    country,
    region: mappedRegion, // Region được map từ categories
    dataAmount,
    validity,
    price: price || 9.99,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
    coverage: coverage.length > 0 ? coverage : [country],
    image,
    description: product.short_description || product.description || `eSIM data plan for ${country}`,
    // THÊM TRƯỜNG NÀY - lấy trực tiếp từ API
    rawCategories: categories, // Giữ nguyên object gốc từ API
    categoryNames: categoryNames // Chỉ lấy tên
  };
};

// Cập nhật interface EsimProduct
export interface EsimProduct {
  id: string;
  name: string;
  country: string;
  region: string;
  dataAmount: string;
  validity: string;
  price: number;
  originalPrice?: number;
  coverage: string[];
  image: string;
  description: string;
  // THÊM 2 TRƯỜNG MỚI
  rawCategories?: Array<{ id: number; name: string; slug: string }>;
  categoryNames?: string[];
}

// =====================================================
// useProducts - Lấy tất cả sản phẩm
// =====================================================
export const useProducts = () => {
  const [data, setData] = useState<EsimProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setIsLoading(true);
        const token = getToken();
        
        let page = 1;
        let allProducts: any[] = [];
        let hasMore = true;
        const perPage = 100;

        while (hasMore) {
          console.log(`Fetching page ${page}...`);
          
          const response = await fetch(
            `${API_URL}/wp-json/wc/v3/products?per_page=${perPage}&page=${page}&status=publish`, 
            {
              headers: token ? {
                'Authorization': `Bearer ${token}`
              } : {}
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          let products = await response.json();
          
          // XỬ LÝ RESPONSE FORMAT - Kiểm tra và lấy đúng mảng products
          console.log(`Page ${page} response:`, products);

          // Trường hợp 1: Response là mảng trực tiếp
          if (Array.isArray(products)) {
            // Đã là mảng, giữ nguyên
          }
          // Trường hợp 2: Response có cấu trúc { success: true, data: [...] }
          else if (products?.success && products?.data) {
            if (Array.isArray(products.data)) {
              products = products.data;
            } else if (products.data?.products && Array.isArray(products.data.products)) {
              products = products.data.products;
            } else {
              products = [];
            }
          }
          // Trường hợp 3: Response có cấu trúc { data: [...] }
          else if (products?.data && Array.isArray(products.data)) {
            products = products.data;
          }
          // Trường hợp 4: Response là object không phải mảng
          else if (products && typeof products === 'object' && !Array.isArray(products)) {
            // Thử tìm bất kỳ property nào là mảng
            const possibleArrays = Object.values(products).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
              products = possibleArrays[0]; // Lấy mảng đầu tiên tìm thấy
            } else {
              products = [];
            }
          }
          // Trường hợp 5: Không phải mảng
          else {
            console.warn('Unexpected response format on page', page, ':', products);
            products = [];
          }

          // Đảm bảo products là mảng
          if (!Array.isArray(products)) {
            products = [];
          }

          // Nếu không có sản phẩm nào, thoát vòng lặp
          if (products.length === 0) {
            hasMore = false;
            break;
          }

          // Thêm sản phẩm vào collection
          allProducts = [...allProducts, ...products];
          
          // Kiểm tra nếu đã hết trang
          if (products.length < perPage) {
            hasMore = false;
          } else {
            page++;
          }

          // Delay nhỏ để tránh rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log(`✅ Fetched total ${allProducts.length} products from ${page} pages`);

        // Transform all products
        const esimProducts = allProducts
          .filter((p: any) => p && p.id) // Chỉ lấy sản phẩm hợp lệ
          .map((p: any) => transformWooCommerceProduct(p));

        console.log('✅ Transformed eSIM products:', esimProducts.length);
        
        setData(esimProducts.length > 0 ? esimProducts : getMockProducts());
        setError(null);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to fetch products');
        setData(getMockProducts());
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, [getToken]);

  return { data, isLoading, error };
};

// =====================================================
// useProduct - Lấy chi tiết 1 sản phẩm
// =====================================================
export const useProduct = (id: string) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      // Kiểm tra id hợp lệ
      if (!id || id === 'undefined' || id.includes('.')) {
        console.log('Invalid product ID:', id);
        setIsLoading(false);
        setError('Invalid product ID');
        return;
      }

      try {
        setIsLoading(true);
        const token = getToken();
        
        // Fetch product details
        const response = await fetch(`${API_URL}/wp-json/wc/v3/products/${id}`, {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Product detail response:', responseData);
        
        // Xử lý response format - API trả về { success: true, data: {...} }
        let productData;
        if (responseData.success && responseData.data) {
          productData = responseData.data;
        } else if (responseData.data) {
          productData = responseData.data;
        } else {
          productData = responseData;
        }

        // Fetch variations if product is variable
        let variations = [];
        if (productData.type === 'variable' && productData.variations?.length > 0) {
          try {
            const variationsResponse = await fetch(
              `${API_URL}/wp-json/wc/v3/products/${id}/variations?per_page=100`,
              {
                headers: token ? {
                  'Authorization': `Bearer ${token}`
                } : {}
              }
            );
            
            if (variationsResponse.ok) {
              const variationsData = await variationsResponse.json();
              
              // Xử lý format variations response
              if (Array.isArray(variationsData)) {
                variations = variationsData;
              } else if (variationsData.data && Array.isArray(variationsData.data)) {
                variations = variationsData.data;
              }
              
              console.log('Fetched variations:', variations.length);
            }
          } catch (variationError) {
            console.error('Error fetching variations:', variationError);
            // Không throw error, chỉ log và tiếp tục
          }
        }

        // Transform product with variations
        const transformed = transformProductDetail(productData, variations);
        setData(transformed);
        setError(null);
        
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to fetch product');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, getToken]);

  return { data, isLoading, error };
};

// Hàm transform riêng cho product detail
const transformProductDetail = (product: any, variations: any[] = []) => {
  if (!product) return null;

  // Parse description để lấy features và specs
  const parsedData = parseProductDescription(product.description || '');
  
  // Xử lý variations
  const processedVariations = variations.map((v: any) => ({
    id: v.id,
    name: getVariationName(v.attributes),
    price: v.display_price || v.price || '0',
    regular_price: v.regular_price || '',
    sale_price: v.sale_price || '',
    dataAmount: extractDataAmountFromVariation(v.attributes || []),
    validity: extractValidityFromVariation(v.attributes || []),
    attributes: v.attributes || [],
    sku: v.sku || '',
    stock_status: v.stock_status || 'instock',
    image: sanitizeImageUrl(v.image?.src || product.images?.[0]?.src)
  }));

  // Xử lý attributes
  const attributes = product.attributes?.map((attr: any) => ({
    id: attr.id,
    name: attr.name,
    slug: attr.slug,
    options: attr.options || []
  })) || [];

  // Lấy image chính
  const mainImage = sanitizeImageUrl(
    product.images && product.images.length > 0 ? product.images[0].src : null
  );

  // Xử lý categories
  const categories = product.categories?.map((cat: any) => cat.name) || [];

  return {
    id: product.id?.toString() || '',
    name: product.name || '',
    slug: product.slug || '',
    type: product.type || 'simple',
    status: product.status || 'publish',
    description: product.description || '',
    short_description: product.short_description || '',
    
    // Giá
    price: product.price ? parseFloat(product.price) : 0,
    regular_price: product.regular_price ? parseFloat(product.regular_price) : 0,
    sale_price: product.sale_price ? parseFloat(product.sale_price) : 0,
    on_sale: product.on_sale || false,
    
    // Images
    images: product.images?.map((img: any) => ({
      id: img.id,
      src: sanitizeImageUrl(img.src),
      alt: img.alt || '',
      thumbnail: sanitizeImageUrl(img.thumbnail || img.src)
    })) || [],
    image: mainImage,
    
    // Categories & Tags
    categories,
    tags: product.tags?.map((tag: any) => tag.name) || [],
    
    // Attributes & Variations
    attributes,
    variations: processedVariations,
    has_options: product.has_options || product.type === 'variable',
    
    // Meta data từ description
    country: parsedData.country || product.name || '',
    region: parsedData.region || categories[0] || 'Global',
    dataAmount: parsedData.dataAmount || extractDataFromVariations(processedVariations),
    validity: parsedData.validity || extractValidityFromVariations(processedVariations),
    coverage: parsedData.coverage || [parsedData.country || product.name],
    features: parsedData.features || {},
    technical_specs: parsedData.technicalSpecs || {},
    
    // Stock
    stock_status: product.stock_status || 'instock',
    stock_quantity: product.stock_quantity,
    
    // Additional
    sku: product.sku || '',
    purchase_note: product.purchase_note || '',
    average_rating: product.average_rating || '0',
    review_count: product.rating_count || 0,
    
    // Related products
    related_ids: product.related_ids || []
  };
};

// Helper functions for product detail
const parseProductDescription = (htmlString: string) => {
  const result = {
    features: {},
    technicalSpecs: {},
    country: '',
    region: '',
    dataAmount: '',
    validity: '',
    coverage: [] as string[]
  };

  if (!htmlString) return result;

  try {
    // Extract country từ tên hoặc từ description
    const countryMatch = htmlString.match(/Use In:?\s*[🇿🇦🇺🇸🇬🇧🇯🇵🇰🇷]?\s*([A-Za-z\s]+)/i);
    if (countryMatch) {
      result.country = countryMatch[1].trim();
    }

    // Extract features
    const featureItems = htmlString.match(/<li class="feature-item"[^>]*data-feature="([^"]*)"[^>]*>([\s\S]*?)<\/li>/g);
    if (featureItems) {
      featureItems.forEach((item: string) => {
        const featureMatch = item.match(/data-feature="([^"]*)"/);
        const contentMatch = item.match(/<li[^>]*>([\s\S]*?)<\/li>/);
        if (featureMatch && contentMatch) {
          const key = featureMatch[1];
          let value = contentMatch[1].replace(/<[^>]*>/g, '').trim();
          value = value.replace(/^\s*<strong>[^>]*<\/strong>\s*/, ''); // Remove strong tags content
          
          if (key === 'use-in') {
            result.country = value.replace(/[🇿🇦🇺🇸🇬🇧🇯🇵🇰🇷]/g, '').trim();
            result.coverage.push(result.country);
          } else if (key === 'data-only') {
            result.dataAmount = value;
          }
          
          result.features[key] = value;
        }
      });
    }

    // Extract technical specs
    const specItems = htmlString.match(/<li class="spec-item"[^>]*data-spec="([^"]*)"[^>]*>([\s\S]*?)<\/li>/g);
    if (specItems) {
      specItems.forEach((item: string) => {
        const specMatch = item.match(/data-spec="([^"]*)"/);
        const contentMatch = item.match(/<li[^>]*>([\s\S]*?)<\/li>/);
        if (specMatch && contentMatch) {
          const key = specMatch[1];
          let value = contentMatch[1].replace(/<[^>]*>/g, '').trim();
          value = value.replace(/^\s*<strong>[^>]*<\/strong>\s*/, ''); // Remove strong tags content
          
          if (key === 'country-list') {
            result.coverage = value.split(',').map((c: string) => c.trim());
          } else if (key === 'pre-activation') {
            result.validity = value;
          }
          
          result.technicalSpecs[key] = value;
        }
      });
    }

  } catch (e) {
    console.error('Error parsing description:', e);
  }

  return result;
};

const getVariationName = (attributes: any[]) => {
  if (!attributes || attributes.length === 0) return 'Default';
  const planAttr = attributes.find((attr: any) => attr.name === 'Plan' || attr.slug === 'pa_plan');
  return planAttr ? planAttr.option : attributes[0]?.option || 'Default';
};

const extractDataAmountFromVariation = (attributes: any[]) => {
  const planAttr = attributes.find((attr: any) => attr.name === 'Plan' || attr.slug === 'pa_plan');
  if (planAttr && planAttr.option) {
    const match = planAttr.option.match(/(\d+\s*(?:GB|MB|TB))/i);
    return match ? match[1] : 'N/A';
  }
  return 'N/A';
};

const extractValidityFromVariation = (attributes: any[]) => {
  const planAttr = attributes.find((attr: any) => attr.name === 'Plan' || attr.slug === 'pa_plan');
  if (planAttr && planAttr.option) {
    const match = planAttr.option.match(/(\d+\s*(?:Days?|D|Ngày))/i);
    return match ? match[1] : 'N/A';
  }
  return 'N/A';
};

const extractDataFromVariations = (variations: any[]) => {
  if (variations.length === 0) return 'N/A';
  const dataAmounts = variations.map(v => v.dataAmount).filter(Boolean);
  return dataAmounts.length > 0 ? dataAmounts[0] : 'N/A';
};

const extractValidityFromVariations = (variations: any[]) => {
  if (variations.length === 0) return 'N/A';
  const validities = variations.map(v => v.validity).filter(Boolean);
  return validities.length > 0 ? validities[0] : 'N/A';
};

// =====================================================
// useFeaturedProducts - Lấy sản phẩm nổi bật
// =====================================================
export const useFeaturedProducts = (limit: number = 4) => {
  const [data, setData] = useState<EsimProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        const token = getToken();
        
        const response = await fetch(`${API_URL}/wp-json/wc/v3/products?per_page=${limit}&featured=true`, {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();
        
        // Xử lý format response
        let productsArray = [];
        
        if (jsonResponse.success && jsonResponse.data?.products && Array.isArray(jsonResponse.data.products)) {
          productsArray = jsonResponse.data.products;
        } else if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
          productsArray = jsonResponse.data;
        } else if (Array.isArray(jsonResponse)) {
          productsArray = jsonResponse;
        } else {
          console.warn('Unexpected API response format:', jsonResponse);
          productsArray = [];
        }
        
        // Transform products
        const featuredProducts = productsArray
          .filter((p: any) => p)
          .map((p: any) => transformWooCommerceProduct(p))
          .slice(0, limit);

        setData(featuredProducts.length > 0 ? featuredProducts : getMockProducts().slice(0, limit));
        setError(null);
      } catch (err: any) {
        console.error('Error fetching featured products:', err);
        setError(err.message || 'Failed to fetch featured products');
        setData(getMockProducts().slice(0, limit));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, [limit, getToken]);

  return { data, isLoading, error };
};

// =====================================================
// useMyEsims - Lấy danh sách eSIM đã mua của user
// =====================================================
export const useMyEsims = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken, user } = useAuth();

  useEffect(() => {
    const fetchMyEsims = async () => {
      try {
        setIsLoading(true);
        const token = getToken();

        if (!token || !user) {
          setData([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/wp-json/wc/v3/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orders = await response.json();
        
        const myEsims: any[] = [];
        
        safeArray(orders).forEach((order: any) => {
          if (order.line_items) {
            safeArray(order.line_items).forEach((item: any) => {
              if (item.name && item.name.toLowerCase().includes('esim')) {
                myEsims.push({
                  id: item.product_id?.toString() || Math.random().toString(),
                  orderId: order.id,
                  name: item.name || 'eSIM',
                  quantity: item.quantity || 1,
                  status: order.status || 'completed',
                  purchaseDate: order.date_created || new Date().toISOString(),
                  total: item.total || '0',
                  iccid: item.meta_data?.find((m: any) => m.key === 'iccid')?.value,
                  activationCode: item.meta_data?.find((m: any) => m.key === 'activation_code')?.value,
                  expiryDate: item.meta_data?.find((m: any) => m.key === 'expiry_date')?.value
                });
              }
            });
          }
        });

        setData(myEsims.length > 0 ? myEsims : getMockMyEsims());
        setError(null);
      } catch (err: any) {
        console.error('Error fetching my esims:', err);
        setError(err.message || 'Failed to fetch my eSIMs');
        setData(getMockMyEsims());
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyEsims();
  }, [getToken, user]);

  return { data, isLoading, error };
};

// =====================================================
// useMyOrders - Lấy danh sách đơn hàng của user
// =====================================================
export const useMyOrders = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken, user } = useAuth();

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setIsLoading(true);
        const token = getToken();

        if (!token || !user) {
          setData([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/wp-json/wc/v3/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orders = await response.json();
        
        const formattedOrders = safeArray(orders).map((order: any) => ({
          id: order.id,
          orderNumber: `#${order.id}`,
          date: order.date_created ? new Date(order.date_created).toLocaleDateString('vi-VN') : 'N/A',
          status: order.status || 'pending',
          total: safeParsePrice(order.total),
          currency: order.currency || 'USD',
          paymentMethod: order.payment_method_title || 'Unknown',
          items: safeArray(order.line_items).map((item: any) => ({
            id: item.product_id,
            name: item.name || 'Product',
            quantity: item.quantity || 1,
            price: safeParsePrice(item.price),
            total: safeParsePrice(item.total)
          })),
          shipping: {
            fullName: (order.shipping?.first_name || '') + ' ' + (order.shipping?.last_name || ''),
            address: order.shipping?.address_1 || '',
            city: order.shipping?.city || '',
            country: order.shipping?.country || ''
          },
          billing: {
            fullName: (order.billing?.first_name || '') + ' ' + (order.billing?.last_name || ''),
            email: order.billing?.email || '',
            phone: order.billing?.phone || ''
          }
        }));

        setData(formattedOrders.length > 0 ? formattedOrders : getMockMyOrders());
        setError(null);
      } catch (err: any) {
        console.error('Error fetching my orders:', err);
        setError(err.message || 'Failed to fetch orders');
        setData(getMockMyOrders());
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyOrders();
  }, [getToken, user]);

  return { data, isLoading, error };
};

// =====================================================
// MOCK DATA
// =====================================================
const getMockProducts = (): EsimProduct[] => [
  {
    id: '1',
    name: 'Vietnam eSIM 5GB',
    country: 'Vietnam',
    region: 'Asia',
    dataAmount: '5GB',
    validity: '30 days',
    price: 9.99,
    coverage: ['Vietnam'],
    image: 'https://placehold.co/400x300?text=Vietnam+eSIM',
    description: 'Perfect for short trips to Vietnam'
  },
  {
    id: '2',
    name: 'Thailand eSIM 10GB',
    country: 'Thailand',
    region: 'Asia',
    dataAmount: '10GB',
    validity: '15 days',
    price: 12.99,
    originalPrice: 15.99,
    coverage: ['Thailand'],
    image: 'https://placehold.co/400x300?text=Thailand+eSIM',
    description: 'Ideal for tourists in Thailand'
  },
  {
    id: '3',
    name: 'Japan eSIM 3GB',
    country: 'Japan',
    region: 'Asia',
    dataAmount: '3GB',
    validity: '8 days',
    price: 8.99,
    coverage: ['Japan'],
    image: 'https://placehold.co/400x300?text=Japan+eSIM',
    description: 'Stay connected in Japan'
  },
  {
    id: '4',
    name: 'Europe eSIM 10GB',
    country: 'Multiple Countries',
    region: 'Europe',
    dataAmount: '10GB',
    validity: '30 days',
    price: 19.99,
    originalPrice: 24.99,
    coverage: ['France', 'Germany', 'Italy', 'Spain'],
    image: 'https://placehold.co/400x300?text=Europe+eSIM',
    description: 'Travel across Europe with one eSIM'
  }
];

const getMockMyEsims = () => [
  {
    id: 'esim-001',
    orderId: 'ORD-123456',
    name: 'Vietnam eSIM 5GB',
    quantity: 1,
    status: 'completed',
    purchaseDate: '2026-02-15T10:30:00Z',
    total: '9.99',
    iccid: '89011234567890123456',
    activationCode: 'ACTV-ABCD-1234',
    expiryDate: '2026-03-17T10:30:00Z',
    dataUsed: '1.2',
    dataTotal: '5',
    daysLeft: 27
  },
  {
    id: 'esim-002',
    orderId: 'ORD-123457',
    name: 'Thailand eSIM 10GB',
    quantity: 1,
    status: 'completed',
    purchaseDate: '2026-02-10T15:45:00Z',
    total: '12.99',
    iccid: '89011234567890123457',
    activationCode: 'ACTV-EFGH-5678',
    expiryDate: '2026-02-25T15:45:00Z',
    dataUsed: '8.5',
    dataTotal: '10',
    daysLeft: 7
  }
];

const getMockMyOrders = () => [
  {
    id: 123456,
    orderNumber: '#123456',
    date: '18/02/2026',
    status: 'completed',
    total: 29.97,
    currency: 'USD',
    paymentMethod: 'Amazon Pay',
    items: [
      {
        id: 1,
        name: 'Vietnam eSIM 5GB',
        quantity: 2,
        price: 9.99,
        total: 19.98
      },
      {
        id: 2,
        name: 'Thailand eSIM 10GB',
        quantity: 1,
        price: 12.99,
        total: 12.99
      }
    ],
    shipping: {
      fullName: 'Test User',
      address: '123 Main St',
      city: 'Ho Chi Minh City',
      country: 'VN'
    },
    billing: {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '0901234567'
    }
  },
  {
    id: 123457,
    orderNumber: '#123457',
    date: '15/02/2026',
    status: 'processing',
    total: 19.99,
    currency: 'USD',
    paymentMethod: 'Amazon Pay',
    items: [
      {
        id: 4,
        name: 'Europe eSIM 10GB',
        quantity: 1,
        price: 19.99,
        total: 19.99
      }
    ],
    shipping: {
      fullName: 'Test User',
      address: '123 Main St',
      city: 'Ho Chi Minh City',
      country: 'VN'
    },
    billing: {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '0901234567'
    }
  }
];

// =====================================================
// createOrder - Tạo đơn hàng mới trên WooCommerce
// =====================================================
export const createOrder = async (
  token: string,
  orderPayload: {
    billing: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
    line_items: Array<{
      product_id: number;
      variation_id?: number;
      quantity: number;
    }>;
    payment_method: string;
    payment_method_title: string;
    set_paid: boolean;
  }
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || data.message || 'Failed to create order' };
    }

    // Backend returns { success: true, data: wooOrder }
    return { success: true, data: data.success ? data.data : data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
};

// =====================================================
// ESIM PROVISIONING APIs
// =====================================================

// Get provisioning status for an order
export const useProvisioningStatus = (orderId: number) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchStatus = async () => {
      if (!orderId) return;
      
      try {
        setIsLoading(true);
        const token = getToken();
        
        const response = await fetch(`${API_URL}/api/admin/provision/status/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching provisioning status:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [orderId, getToken]);

  return { data, isLoading, error };
};

// Manually trigger provisioning (admin only)
export const useManualProvision = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const provision = async (orderId: number, sku: string, quantity: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      
      const response = await fetch(`${API_URL}/api/admin/provision/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, sku, quantity })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Provisioning failed');
      }

      return { success: true, data: data.data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { provision, loading, error };
};