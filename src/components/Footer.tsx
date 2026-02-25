import logo_dark from "@/assets/ICON_DARK.png";
import logo_light from "@/assets/ICON_LIGHT.png";
import { Headphones, Mail, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-20 w-40 items-center justify-center rounded-lg">
              <img
                src={logo_light}
                alt="STOAHUB logo"
                className="h-30 w-40 object-contain dark:hidden"
              />

              {/* Dark mode */}
              <img
                src={logo_dark}
                alt="STOAHUB logo"
                className="h-30 w-40 object-contain hidden dark:block"
              />
              </div>
            </Link>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/esims" className="text-sm text-muted-foreground hover:text-primary transition-colors">Browse eSIMs</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
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
          © {new Date().getFullYear()} STOAHUB. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
