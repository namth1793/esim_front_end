import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMyEsims, useMyOrders } from "@/hooks/useApi";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Download,
  Eye,
  Loader2,
  LogOut,
  Package,
  QrCode,
  Smartphone,
  User,
  Wifi
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Order Detail Component
const OrderDetail = ({ order, onBack }: { order: any; onBack: () => void }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
      case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to orders</span>
      </button>

      {/* Order Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Order #{order.orderNumber || order.id?.slice(0, 8)}
            </h2>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(order.created_at || order.date).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        {/* Order Summary */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-foreground">
              ${Number(order.total).toFixed(2)} {order.currency}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Payment Method</p>
            <p className="font-medium text-foreground">{order.paymentMethod || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Items</h3>
        <div className="space-y-3">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-medium text-foreground">${Number(item.price).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping & Billing */}
      {(order.shipping || order.billing) && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Shipping Information</h3>
          {order.shipping?.fullName && (
            <div className="space-y-2">
              <p className="font-medium text-foreground">{order.shipping.fullName}</p>
              <p className="text-sm text-muted-foreground">{order.shipping.address}</p>
              <p className="text-sm text-muted-foreground">
                {order.shipping.city}, {order.shipping.country}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// eSIM Detail Component
const EsimDetail = ({ esim, onBack }: { esim: any; onBack: () => void }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadQR = () => {
    if (!esim.qr_code_url) return;
    
    const link = document.createElement('a');
    link.href = esim.qr_code_url;
    link.download = `esim-${esim.iccid || esim.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to eSIMs</span>
      </button>

      {/* eSIM Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {esim.name || 'eSIM'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Purchased on {new Date(esim.purchaseDate || esim.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            esim.status === 'active' 
              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
          }`}>
            {esim.status}
          </span>
        </div>

        {/* eSIM Details */}
        <div className="space-y-4">
          {/* ICCID */}
          {esim.iccid && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">ICCID</p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 font-mono text-sm">{esim.iccid}</code>
                <button
                  onClick={() => copyToClipboard(esim.iccid, 'iccid')}
                  className="p-2 hover:bg-background rounded-md transition-colors"
                >
                  {copied === 'iccid' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Activation Code */}
          {esim.activation_code && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Activation Code</p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 font-mono text-sm">{esim.activation_code}</code>
                <button
                  onClick={() => copyToClipboard(esim.activation_code, 'code')}
                  className="p-2 hover:bg-background rounded-md transition-colors"
                >
                  {copied === 'code' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* SM-DP+ Address */}
          {esim.smdp_address && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">SM-DP+ Address</p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 font-mono text-sm">{esim.smdp_address}</code>
                <button
                  onClick={() => copyToClipboard(esim.smdp_address, 'smdp')}
                  className="p-2 hover:bg-background rounded-md transition-colors"
                >
                  {copied === 'smdp' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Data Usage */}
          {esim.dataTotal && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Data Usage</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{esim.dataUsed || 0}GB / {esim.dataTotal}GB</span>
                  <span>{Math.round((esim.dataUsed || 0) / esim.dataTotal * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, ((esim.dataUsed || 0) / esim.dataTotal * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* QR Code */}
          {esim.qr_code_url && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">QR Code</p>
              <div className="flex flex-col items-center gap-3 p-4 bg-muted rounded-lg">
                <img 
                  src={esim.qr_code_url} 
                  alt="eSIM QR Code"
                  className="w-48 h-48 object-contain bg-white p-2 rounded-lg"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadQR}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowQr(!showQr)}>
                    <Eye className="mr-2 h-4 w-4" /> {showQr ? 'Hide' : 'Show'} Large
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Expiry Date */}
          {esim.expiryDate && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Expires: {new Date(esim.expiryDate).toLocaleDateString('vi-VN')}</span>
            </div>
          )}
        </div>

        {/* Installation Guide */}
        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-foreground">Installation Guide</h4>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>iOS:</strong> Settings → Cellular → Add Cellular Plan → Scan QR</p>
            <p><strong>Android:</strong> Settings → Network & Internet → Mobile Network → Add eSIM → Scan QR</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user, role, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useMyOrders();
  const { data: esims = [], isLoading: esimsLoading, refetch: refetchEsims } = useMyEsims();
  const [tab, setTab] = useState<"profile" | "orders" | "esims">("profile");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedEsim, setSelectedEsim] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const loading = authLoading || ordersLoading || esimsLoading;

  if (authLoading || !user) {
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

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
      case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 rounded-xl border border-border bg-muted p-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setSelectedOrder(null);
                setSelectedEsim(null);
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex-1 justify-center ${
                tab === t.id && !selectedOrder && !selectedEsim
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* Profile Tab */}
          {tab === "profile" && !selectedOrder && !selectedEsim && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4"
            >
              <h2 className="font-display text-lg font-semibold text-foreground">Profile</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">{user?.fullName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{user.email}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {tab === "orders" && !selectedOrder && (
            <motion.div
              key="orders-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-border bg-card shadow-card">
                  <Package className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/esims')}
                    className="mt-2"
                  >
                    Browse eSIMs
                  </Button>
                </div>
              ) : (
                orders.map((order: any) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground">
                            Order #{order.orderNumber || order.id?.slice(0, 8)}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at || order.date).toLocaleDateString('vi-VN')}
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">
                            {order.items?.length || 0} items
                          </span>
                          <span className="text-xs font-medium text-foreground">
                            ${Number(order.total).toFixed(2)} {order.currency}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Selected Order Detail */}
          {selectedOrder && (
            <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />
          )}

          {/* eSIMs Tab */}
          {tab === "esims" && !selectedEsim && (
            <motion.div
              key="esims-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : esims.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-border bg-card shadow-card">
                  <QrCode className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No eSIMs purchased yet</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/esims')}
                    className="mt-2"
                  >
                    Browse eSIMs
                  </Button>
                </div>
              ) : (
                esims.map((esim: any) => (
                  <motion.div
                    key={esim.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEsim(esim)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground">
                            {esim.name || `eSIM ${esim.id.slice(0, 8)}`}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(esim.status)}`}>
                            {esim.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Purchased: {new Date(esim.purchaseDate || esim.created_at).toLocaleDateString('vi-VN')}
                        </p>
                        {esim.iccid && (
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            ICCID: {esim.iccid.slice(0, 16)}...
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Selected eSIM Detail */}
          {selectedEsim && (
            <EsimDetail esim={selectedEsim} onBack={() => setSelectedEsim(null)} />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Dashboard;