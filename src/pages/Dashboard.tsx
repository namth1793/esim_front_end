import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Package, CreditCard, QrCode, LogOut, Loader2, Wifi } from "lucide-react";
import Layout from "@/components/Layout";

const Dashboard = () => {
  const { user, profile, role, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [esims, setEsims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"profile" | "orders" | "esims">("profile");

  useEffect(() => {
    if (!authLoading && !user) { navigate("/login"); return; }
    if (user) fetchData();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    const [ordersRes, esimsRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("purchased_esims").select("*").order("created_at", { ascending: false }),
    ]);
    setOrders((ordersRes.data as any[]) || []);
    setEsims((esimsRes.data as any[]) || []);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "orders" as const, label: "Orders", icon: CreditCard },
    { id: "esims" as const, label: "My eSIMs", icon: Wifi },
  ];

  return (
    <Layout>
      <div className="container max-w-4xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 rounded-xl border border-border bg-muted p-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex-1 justify-center ${
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Profile */}
        {tab === "profile" && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Profile</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{profile?.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{profile?.email || user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
                  role === "agent" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                }`}>
                  {role === "agent" ? "Agent" : "Customer"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-border bg-card shadow-card">
                <Package className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              orders.map((o: any) => (
                <div key={o.id} className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Order #{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">${Number(o.total).toFixed(2)}</p>
                    <span className={`text-xs font-medium ${o.status === "completed" ? "text-accent" : "text-muted-foreground"}`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* eSIMs */}
        {tab === "esims" && (
          <div className="space-y-4">
            {esims.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-border bg-card shadow-card">
                <QrCode className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No eSIMs purchased yet</p>
              </div>
            ) : (
              esims.map((e: any) => (
                <div key={e.id} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{e.esim_id}</p>
                    <span className={`text-xs font-medium rounded-full px-3 py-0.5 ${
                      e.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                    }`}>
                      {e.status}
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">SM-DP+ Address</p>
                      <p className="font-mono text-foreground">{e.smdp_address || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Activation Code</p>
                      <p className="font-mono text-foreground">{e.activation_code || "—"}</p>
                    </div>
                  </div>
                  {e.qr_code_url && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">QR Code</p>
                      <div className="h-24 w-24 rounded-lg border border-border bg-muted flex items-center justify-center">
                        <QrCode className="h-12 w-12 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
