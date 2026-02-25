import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { createOrder } from "@/hooks/useApi";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Loader2,
  ShoppingBag
} from "lucide-react";
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

interface BillingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const [checkoutData, setCheckoutData] = useState<CheckoutState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Split fullName into first + last
  const nameParts = (user?.fullName || '').trim().split(/\s+/);
  const defaultFirstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || '';
  const defaultLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  const [billing, setBilling] = useState<BillingForm>({
    firstName: defaultFirstName,
    lastName: defaultLastName,
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (location.state) {
      setCheckoutData(location.state as CheckoutState);
      setLoading(false);
    } else {
      const savedCart = sessionStorage.getItem('checkout_cart');
      const savedOrder = sessionStorage.getItem('checkout_order');

      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        const items = Array.isArray(cartItems) ? cartItems : [];
        const subtotal = items.reduce((sum: number, item: CartItem) =>
          sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.1;
        setCheckoutData({ items, subtotal, tax, total: subtotal + tax });
      } else if (savedOrder) {
        const order = JSON.parse(savedOrder);
        const items = order ? [order] : [];
        const subtotal = order?.total || 0;
        const tax = subtotal * 0.1;
        setCheckoutData({ items, subtotal, tax, total: subtotal + tax });
      } else {
        setCheckoutData(null);
      }
      setLoading(false);
    }
  }, [location]);

  const handleBillingChange = (field: keyof BillingForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setBilling(prev => ({ ...prev, [field]: e.target.value }));

  const handlePayment = async () => {
    if (!checkoutData || checkoutData.items.length === 0) {
      toast.error('No items to checkout');
      return;
    }
    if (!billing.firstName || !billing.email) {
      toast.error('Please fill in your name and email');
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    const orderPayload = {
      payment_method: 'bacs',
      payment_method_title: 'Bank Transfer',
      set_paid: false,
      billing: {
        first_name: billing.firstName,
        last_name: billing.lastName,
        email: billing.email,
        phone: billing.phone,
        address_1: '',
        city: '',
        country: 'VN',
      },
      line_items: checkoutData.items.map(item => ({
        product_id: parseInt(item.productId, 10),
        ...(item.variationId ? { variation_id: item.variationId } : {}),
        quantity: item.quantity,
      })),
      customer_note: `eSIM order via STOAHUB app`,
    };

    const result = await createOrder(token, orderPayload as any);

    setIsProcessing(false);

    if (result.success) {
      // Clear cart
      localStorage.removeItem('cart');
      sessionStorage.removeItem('checkout_order');
      sessionStorage.removeItem('checkout_cart');
      window.dispatchEvent(new Event('cartUpdated'));

      setConfirmedOrder(result.data);
      toast.success('Order placed successfully!');
    } else {
      toast.error(result.error || 'Failed to place order. Please try again.');
    }
  };

  // ─── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Order Confirmed ───────────────────────────────────────
  if (confirmedOrder) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <CheckCircle className="h-20 w-20 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Order Placed!
            </h2>
            <p className="text-muted-foreground mb-2">
              Order <span className="font-semibold text-foreground">#{confirmedOrder.id}</span> has been created.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Status: <span className="capitalize font-medium text-foreground">{confirmedOrder.status}</span>
              {' '}— we will process your order shortly.
            </p>
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-left mb-6 text-sm space-y-1">
              <p className="font-medium text-foreground mb-2">Bank Transfer Details</p>
              <p className="text-muted-foreground">Please transfer the total amount to complete your order. Details will be emailed to <span className="font-medium">{billing.email}</span>.</p>
            </div>
            <Button
              className="bg-gradient-cta text-primary-foreground w-full"
              onClick={() => navigate('/dashboard')}
            >
              View My Orders
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Empty Cart ────────────────────────────────────────────
  if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No items to checkout</h2>
            <p className="text-muted-foreground mb-6">
              Your cart is empty. Browse our eSIMs and find the perfect plan.
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

        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* ── Left: Order Summary + Billing ── */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Summary */}
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
                          <span className="text-xs bg-secondary/30 px-2 py-0.5 rounded-full">{item.dataAmount}</span>
                        )}
                        {item.validity && (
                          <span className="text-xs bg-secondary/30 px-2 py-0.5 rounded-full">{item.validity}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-muted-foreground">Qty: {item.quantity || 0}</span>
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

            {/* Billing Info */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold mb-4">Billing Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">First Name <span className="text-destructive">*</span></label>
                  <input
                    type="text"
                    value={billing.firstName}
                    onChange={handleBillingChange('firstName')}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <input
                    type="text"
                    value={billing.lastName}
                    onChange={handleBillingChange('lastName')}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Last name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Email <span className="text-destructive">*</span></label>
                  <input
                    type="email"
                    value={billing.email}
                    onChange={handleBillingChange('email')}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <input
                    type="tel"
                    value={billing.phone}
                    onChange={handleBillingChange('phone')}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="+84 90 123 4567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Payment ── */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold mb-4">Payment Method</h2>

              {/* Bank Transfer Option */}
              <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">
                      Transfer to our bank account. Order activates after payment confirmed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total due</span>
                  <span className="font-bold text-foreground">${(total || 0).toFixed(2)}</span>
                </div>

                <Button
                  className="w-full py-6 text-lg bg-gradient-cta"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Place Order ${(total || 0).toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing your order, you agree to our Terms of Service
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="font-medium mb-1 text-sm">Secure Checkout</h3>
              <p className="text-xs text-muted-foreground">
                Your information is encrypted and secure. Orders are linked directly to WooCommerce.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
