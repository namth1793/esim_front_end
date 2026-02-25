import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useProduct } from "@/hooks/useApi";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  Info,
  LogIn,
  Shield,
  ShoppingCart,
  Wifi,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

interface Variation {
  id: number;
  name: string;
  price: string;
  dataAmount?: string;
  validity?: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const { data: product, isLoading, error } = useProduct(id || '');

  // Check authentication
  const requireAuth = (action: 'buy' | 'cart') => {
    if (!user) {
      toast.error('Please login first', {
        description: 'You need to be logged in to continue',
        action: {
          label: 'Login',
          onClick: () => navigate('/login', { state: { from: location.pathname } })
        }
      });
      return false;
    }
    return true;
  };

  // Handle Buy Now - Redirect to checkout
  const handleBuyNow = () => {
    if (!requireAuth('buy')) return;
    
    // Create order data với đầy đủ thông tin
    const orderData = {
      id: `${id}-${selectedVariation?.id || 'default'}-${Date.now()}`,
      productId: id,
      variationId: selectedVariation?.id,
      name: selectedVariation?.name || product?.name || 'eSIM',
      quantity: quantity,
      price: currentPrice,
      total: currentPrice * quantity,
      image: product?.images?.[0]?.src,
      dataAmount: selectedVariation?.dataAmount,
      validity: selectedVariation?.validity
    };

    console.log('Saving to checkout_order:', orderData); // Debug log

    // Clear any existing checkout data
    sessionStorage.removeItem('checkout_cart');
    
    // Save order data to sessionStorage
    sessionStorage.setItem('checkout_order', JSON.stringify(orderData));
    
    // Also save as single item array for cart format
    const cartItems = [orderData];
    sessionStorage.setItem('checkout_cart', JSON.stringify(cartItems));
    
    // Redirect to checkout
    navigate('/checkout');

    toast.success('Processing your order...', {
      description: 'Redirecting to checkout'
    });
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!requireAuth('cart')) return;
    
    // Create cart item
    const cartItem: CartItem = {
      id: `${id}-${selectedVariation?.id || 'default'}-${Date.now()}`,
      productId: id || '',
      variationId: selectedVariation?.id,
      name: selectedVariation?.name || product?.name || 'eSIM',
      quantity: quantity,
      price: currentPrice,
      image: product?.images?.[0]?.src,
      dataAmount: selectedVariation?.dataAmount,
      validity: selectedVariation?.validity
    };

    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if same product/variation already exists (without timestamp)
    const existingItemIndex = existingCart.findIndex(
      (item: any) => 
        item.productId === cartItem.productId && 
        item.variationId === cartItem.variationId &&
        item.name === cartItem.name
    );

    if (existingItemIndex >= 0) {
      // Update quantity if exists
      existingCart[existingItemIndex].quantity += quantity;
      toast.success('Cart updated!', {
        description: `${cartItem.name} quantity increased to ${existingCart[existingItemIndex].quantity}`
      });
    } else {
      // Add new item
      existingCart.push(cartItem);
      toast.success('Added to cart!', {
        description: `${cartItem.name} x${quantity} has been added to your cart`,
        action: {
          label: 'View Cart',
          onClick: () => navigate('/cart')
        }
      });
    }

    // Save cart
    localStorage.setItem('cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Parse HTML description to extract features
  const parseDescription = (htmlString: string) => {
    if (!htmlString) return { features: {}, description: '', technicalSpecs: {} };
    
    const features: Record<string, string> = {};
    const technicalSpecs: Record<string, string> = {};
    let description = '';

    try {
      // Extract features
      const featureItems = htmlString.match(/<li class="feature-item"[^>]*data-feature="([^"]*)"[^>]*>([\s\S]*?)<\/li>/g);
      if (featureItems) {
        featureItems.forEach(item => {
          const featureMatch = item.match(/data-feature="([^"]*)"/);
          const contentMatch = item.match(/<li[^>]*>([\s\S]*?)<\/li>/);
          if (featureMatch && contentMatch) {
            const key = featureMatch[1];
            const value = contentMatch[1].replace(/<[^>]*>/g, '').trim();
            features[key] = value;
          }
        });
      }

      // Extract technical specs
      const specItems = htmlString.match(/<li class="spec-item"[^>]*data-spec="([^"]*)"[^>]*>([\s\S]*?)<\/li>/g);
      if (specItems) {
        specItems.forEach(item => {
          const specMatch = item.match(/data-spec="([^"]*)"/);
          const contentMatch = item.match(/<li[^>]*>([\s\S]*?)<\/li>/);
          if (specMatch && contentMatch) {
            const key = specMatch[1];
            const value = contentMatch[1].replace(/<[^>]*>/g, '').trim();
            technicalSpecs[key] = value;
          }
        });
      }

      // Extract description
      const descMatch = htmlString.match(/<div class="box box-description"[^>]*>([\s\S]*?)<\/div>/);
      if (descMatch) {
        description = descMatch[1].replace(/<[^>]*>/g, '').trim();
      }
    } catch (e) {
      console.error('Error parsing description:', e);
    }

    return { features, description, technicalSpecs };
  };

  // Extract variations from product data
  useEffect(() => {
    if (product && product.attributes) {
      const planAttribute = product.attributes.find((attr: any) => attr.name === 'Plan');
      if (planAttribute && planAttribute.options) {
        const extractedVariations = planAttribute.options.map((option: string, index: number) => {
          // Parse data amount and validity from option string (e.g., "South Africa 100MB 7Days")
          const parts = option.split(' ');
          const dataAmount = parts.slice(-2, -1)[0] || 'N/A';
          const validity = parts.slice(-1)[0] || 'N/A';
          
          return {
            id: product.variations?.[index] || index,
            name: option,
            price: product.price || '0',
            dataAmount,
            validity
          };
        });
        setVariations(extractedVariations);
        if (extractedVariations.length > 0) {
          setSelectedVariation(extractedVariations[0]);
        }
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The eSIM you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/esims')} className="bg-primary text-primary-foreground">
              Browse Other eSIMs
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const parsedContent = parseDescription(product.description || '');
  const currentPrice = selectedVariation ? parseFloat(selectedVariation.price) : (product.price ? parseFloat(product.price) : 0);
  const totalPrice = currentPrice * quantity;

  // Get image URL
  const imageUrl = product.images && product.images[0]?.src || 'https://placehold.co/400x300?text=eSIM';
  
  // Get country name from product name
  const countryName = product.name || 'Unknown';

  return (
    <Layout>
      <div className="container py-8">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left column - Image & Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="relative h-80 bg-muted">
                <img 
                  src={imageUrl}
                  alt={countryName}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/400x300?text=eSIM';
                  }}
                />
              </div>
              
              <div className="p-6">
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  {countryName} eSIM
                </h1>
                
                {/* Short description */}
                {product.short_description && (
                  <div 
                    className="text-muted-foreground mb-4 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.short_description }}
                  />
                )}

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-secondary/30 rounded-lg p-4 text-center">
                    <Wifi className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-bold text-foreground">
                      {selectedVariation?.dataAmount || parsedContent.features?.['data-only'] || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-4 text-center">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Validity</p>
                    <p className="font-bold text-foreground">
                      {selectedVariation?.validity || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  {Object.entries(parsedContent.features).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1 shrink-0" />
                      <span className="text-sm text-foreground">
                        <span className="font-medium capitalize">{key.replace(/-/g, ' ')}:</span> {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Technical Specs */}
                {Object.keys(parsedContent.technicalSpecs).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="font-semibold text-foreground mb-3">Technical Specifications</h3>
                    <div className="space-y-2">
                      {Object.entries(parsedContent.technicalSpecs).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key.replace(/-/g, ' ')}:</span>
                          <span className="text-foreground font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right column - Purchase */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="rounded-2xl border border-border bg-card p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Purchase eSIM
              </h2>

              {/* Plan Selection */}
              {variations.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Plan
                  </label>
                  <Select
                    value={selectedVariation?.id.toString()}
                    onValueChange={(value) => {
                      const variation = variations.find(v => v.id.toString() === value);
                      setSelectedVariation(variation || null);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {variations.map((variation) => (
                        <SelectItem key={variation.id} value={variation.id.toString()}>
                          <div className="flex justify-between items-center w-full">
                            <span>{variation.name}</span>
                            <span className="ml-4 font-semibold text-primary">
                              ${parseFloat(variation.price).toFixed(2)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-foreground">
                  ${currentPrice.toFixed(2)}
                </span>
                {product.regular_price && parseFloat(product.regular_price) > currentPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ${parseFloat(product.regular_price).toFixed(2)}
                    </span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                      Save ${(parseFloat(product.regular_price) - currentPrice).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4 border-y border-border mb-6">
                <span className="font-medium text-foreground">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-cta text-primary-foreground py-6 text-lg font-semibold hover:opacity-90 transition-opacity"
                  onClick={handleBuyNow}
                  disabled={!user}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Buy Now
                  {!user && <span className="ml-2 text-xs opacity-75">(Login required)</span>}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full py-6 text-lg font-semibold hover:bg-secondary/20 transition-colors"
                  onClick={handleAddToCart}
                  disabled={!user}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                  {!user && <span className="ml-2 text-xs opacity-75">(Login required)</span>}
                </Button>
              </div>

              {/* Login prompt for non-logged in users */}
              {!user && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm flex items-center gap-3">
                  <LogIn className="h-5 w-5 shrink-0" />
                  <span>
                    <button 
                      onClick={() => navigate('/login', { state: { from: location.pathname } })}
                      className="font-semibold underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Login
                    </button>
                    {' '}to purchase this eSIM
                  </span>
                </div>
              )}

              {/* Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Instant Delivery</p>
                    <p className="text-sm text-muted-foreground">Get your eSIM instantly via email</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Easy Installation</p>
                    <p className="text-sm text-muted-foreground">Simple QR code installation</p>
                  </div>
                </div>
              </div>

              {/* Purchase Note */}
              {product.purchase_note && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
                  <Info className="h-4 w-4 inline mr-1" />
                  <span dangerouslySetInnerHTML={{ __html: product.purchase_note }} />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;