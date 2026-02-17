import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getProductById } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";

const Checkout = () => {
  const { user, role } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const productId = params.get("product");
  const [product, setProduct] = useState<any>(null);
  const [step, setStep] = useState<"review" | "processing" | "success" | "error">("review");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (productId) {
      getProductById(productId).then(setProduct).catch(() => setErrorMsg("Product not found"));
    }
  }, [productId, user, navigate]);

  const price = product ? (role === "agent" ? product.agentPrice : product.price) : 0;

  const handleCheckout = async () => {
    if (!user || !product) return;
    setStep("processing");
    try {
      // Create order in DB
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          items: JSON.stringify([{ product_id: product.id, quantity: 1 }]),
          total: price,
          currency: "USD",
          payment_url: `https://amazonpay.sample.com/checkout/${Date.now()}`,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Simulate Amazon Pay redirect + success
      await new Promise(r => setTimeout(r, 2000));

      // Mark order as paid
      await supabase.from("orders").update({ status: "completed", transaction_id: `TXN-${Date.now()}` } as any).eq("id", (order as any).id);

      // Create purchased eSIM record
      await supabase.from("purchased_esims").insert({
        user_id: user.id,
        order_id: (order as any).id,
        product_id: product.id,
        esim_id: `ESIM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        qr_code_url: "https://sample.com/qrcode.png",
        smdp_address: "smdp.sample.com",
        activation_code: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "active",
      } as any);

      setOrderId((order as any).id);
      setStep("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Checkout failed");
      setStep("error");
    }
  };

  if (!product && !errorMsg) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-lg py-12 space-y-6">
        <Link to={productId ? `/esim/${productId}` : "/esims"} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {step === "review" && product && (
          <div className="space-y-6">
            <h1 className="font-display text-2xl font-bold text-foreground">Checkout</h1>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Order Summary</h2>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.data} · {product.validity}</p>
                </div>
                <p className="font-bold text-foreground">${price.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">${price.toFixed(2)}</span>
              </div>
              {role === "agent" && (
                <p className="text-xs text-accent">Agent pricing applied</p>
              )}
              <Button onClick={handleCheckout} className="w-full bg-gradient-cta text-primary-foreground hover:opacity-90">
                <CreditCard className="mr-2 h-4 w-4" /> Pay with Amazon Pay
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center space-y-4 rounded-2xl border border-border bg-card p-8 shadow-card">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">Processing Payment</h2>
            <p className="text-muted-foreground">Redirecting to Amazon Pay...</p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-4 rounded-2xl border border-border bg-card p-8 shadow-card">
            <CheckCircle className="mx-auto h-12 w-12 text-accent" />
            <h2 className="font-display text-xl font-bold text-foreground">Payment Successful!</h2>
            <p className="text-muted-foreground">Your eSIM is ready. Check your dashboard for installation details.</p>
            <Button onClick={() => navigate("/dashboard")} className="bg-gradient-cta text-primary-foreground">Go to Dashboard</Button>
          </div>
        )}

        {step === "error" && (
          <div className="text-center space-y-4 rounded-2xl border border-border bg-card p-8 shadow-card">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="font-display text-xl font-bold text-foreground">Payment Failed</h2>
            <p className="text-muted-foreground">{errorMsg}</p>
            <Button onClick={() => setStep("review")} variant="outline">Try Again</Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Checkout;
