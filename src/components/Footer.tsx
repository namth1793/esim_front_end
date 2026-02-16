import { Link } from "react-router-dom";
import { Globe, Mail, Shield, Headphones } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-cta">
                <Globe className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-foreground">
                Globe<span className="text-primary">SIM</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Stay connected anywhere in the world with affordable eSIM data plans.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/esims" className="text-sm text-muted-foreground hover:text-primary transition-colors">Browse eSIMs</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">How It Works</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Compatible Devices</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Support</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Installation Guide</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                support@globesim.com
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Headphones className="h-4 w-4" />
                24/7 Live Chat
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Secure Payments
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} GlobeSIM. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
