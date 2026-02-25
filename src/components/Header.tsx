import logo_dark from "@/assets/ICON_DARK.png";
import logo_light from "@/assets/ICON_LIGHT.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Menu,
  ShoppingCart,
  User,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const { user } = useAuth();

  // Update cart count whenever cart changes or user logs in
  useEffect(() => {
    if (user) {
      const updateCartCount = () => {
        const cart = localStorage.getItem('cart');
        if (cart) {
          const items = JSON.parse(cart);
          const count = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      };

      updateCartCount();

      // Listen for cart updates
      window.addEventListener('storage', updateCartCount);
      window.addEventListener('cartUpdated', updateCartCount);

      return () => {
        window.removeEventListener('storage', updateCartCount);
        window.removeEventListener('cartUpdated', updateCartCount);
      };
    } else {
      setCartCount(0);
    }
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  // Custom event to trigger cart update when adding items
  const dispatchCartUpdate = () => {
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Expose function globally for components to call
  useEffect(() => {
    (window as any).updateCartCount = dispatchCartUpdate;
  }, []);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between md:h-18">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-30 w-40 items-center justify-center rounded-lg">
            <img
              src={logo_light}
              alt="STOAHUB logo"
              className="h-30 w-40 object-contain dark:hidden"
            />
            <img
              src={logo_dark}
              alt="STOAHUB logo"
              className="h-30 w-40 object-contain hidden dark:block"
            />
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          
          {/* Cart Icon - Only shown when logged in */}
          {user && (
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
          )}

          {user ? (
            <Button variant="ghost" size="sm" className="bg-gradient-cta text-primary-foreground hover:opacity-90" asChild>
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="bg-gradient-cta text-primary-foreground hover:opacity-90" asChild>
              <Link to="/login">
                <User className="h-4 w-4" />
                Log In
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/50 md:hidden"
          >
            <nav className="container flex flex-col gap-2 py-4">
              {/* Mobile Cart Link - Only when logged in */}
              {user && (
                <Link
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive("/cart")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              <div className="mt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/cart" onClick={() => setMobileOpen(false)}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Cart
                        {cartCount > 0 && ` (${cartCount})`}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <User className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                )}
                <Button size="sm" className="bg-gradient-cta text-primary-foreground" asChild>
                  <Link to="/esims" onClick={() => setMobileOpen(false)}>
                    Browse eSIMs
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;