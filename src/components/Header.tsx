import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Globe, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/esims", label: "eSIMs" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between md:h-18">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-cta">
            <Globe className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Globe<span className="text-primary">SIM</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
          <Button size="sm" className="bg-gradient-cta text-primary-foreground hover:opacity-90" asChild>
            <Link to="/esims">Browse eSIMs</Link>
          </Button>
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
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2">
                {user ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
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
