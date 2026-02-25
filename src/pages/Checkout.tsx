import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CartItem {
  id: string;
  productId: string;
  variationId?: number;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  dataAmount?: string;
  validity?: string;
}

interface CheckoutState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  from?: string;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState<CheckoutState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get checkout data from location state or sessionStorage
    if (location.state) {
      // Coming from cart with multiple items
      setCheckoutData(location.state as CheckoutState);
      setLoading(false);
    } else {
      // Try to get from sessionStorage (single item from product detail)
      const savedOrder = sessionStorage.getItem('checkout_order');
      const savedCart = sessionStorage.getItem('checkout_cart');
      
      if (savedCart) {
        // Multiple items from cart
        const cartItems = JSON.parse(savedCart);
        // Đảm bảo cartItems là array
        const items = Array.isArray(cartItems) ? cartItems : [];
        const subtotal = items.reduce((sum: number, item: CartItem) => 
          sum + (item.price * item.quantity), 0
        );
        const tax = subtotal * 0.1;
        const total = subtotal + tax;
        
        setCheckoutData({
          items: items,
          subtotal,
          tax,
          total
        });
      } else if (savedOrder) {
        // Single item from product detail
        const order = JSON.parse(savedOrder);
        // Đảm bảo order là object hợp lệ
        const items = order ? [order] : [];
        const subtotal = order?.total || 0;
        const tax = subtotal * 0.1;
        const total = subtotal + tax;
        
        setCheckoutData({
          items: items,
          subtotal,
          tax,
          total
        });
      } else {
        // No data found
        setCheckoutData(null);
      }
      setLoading(false);
    }
  }, [location, navigate]);

  const handlePayment = () => {
    if (!checkoutData) {
      toast.error('No checkout data found');
      return;
    }
    
    toast.success('Processing payment...');
    
    // Clear cart after successful checkout
    localStorage.removeItem('cart');
    sessionStorage.removeItem('checkout_order');
    sessionStorage.removeItem('checkout_cart');
    
    // Navigate to success page or order confirmation
    setTimeout(() => {
      navigate('/dashboard/orders');
    }, 2000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No items to checkout</h2>
            <p className="text-muted-foreground mb-6">
              Your cart is empty. Browse our eSIMs and find the perfect plan for your next trip.
            </p>
            <Button onClick={() => navigate('/esims')} className="bg-gradient-cta">
              Browse eSIMs
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const { items, subtotal, tax, total } = checkoutData;
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <h1 className="font-display text-3xl font-bold text-foreground mb-8">
          Checkout
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold mb-4">
                Order Summary ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </h2>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id || index} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="h-16 w-16 bg-muted rounded-lg overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.dataAmount && (
                          <span className="text-xs bg-secondary/30 px-2 py-0.5 rounded-full">
                            {item.dataAmount}
                          </span>
                        )}
                        {item.validity && (
                          <span className="text-xs bg-secondary/30 px-2 py-0.5 rounded-full">
                            {item.validity}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-muted-foreground">
                          Qty: {item.quantity || 0}
                        </span>
                        <span className="font-medium text-foreground">
                          ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${(subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-medium">${(tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">${(total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <Button 
                  className="w-full py-6 text-lg bg-gradient-cta"
                  onClick={handlePayment}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay ${(total || 0).toFixed(2)}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  By proceeding with your purchase, you agree to our Terms of Service
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-medium mb-2">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;