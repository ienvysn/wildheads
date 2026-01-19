import { Heart, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">Aarogya</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Providing quality healthcare with cutting-edge AI technology and compassionate care.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-background transition-colors">
                Home
              </Link>
              <Link to="/features" className="text-sm text-muted-foreground hover:text-background transition-colors">
                Features
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-background transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-background transition-colors">
                Contact
              </Link>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-background transition-colors">
                Staff Login
              </Link>
              <Link to="/register" className="text-sm text-muted-foreground hover:text-background transition-colors">
                Patient Portal
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@arogya.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>123 Healthcare Ave, Medical City</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Hours</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mt-0.5" />
                <div>
                  <p>Emergency: 24/7</p>
                  <p>OPD: Mon-Sat, 8AM-8PM</p>
                  <p>Lab: Mon-Sat, 7AM-9PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-muted-foreground/20 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Aarogya Hospital Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
