import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Store,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";

interface FooterProps {
  siteName?: string;
  siteLogo?: { url: string; alt: string };
  containerWidth?: "standard" | "wide" | "full";
  footerText?: string;
  showSocialLinks?: boolean;
  showNewsletterFooter?: boolean;
  showPaymentMethods?: boolean;
  socialFacebook?: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
  socialYoutube?: string;
  socialTiktok?: string;
}

export function Footer({
  siteName = "MarketPlace Pro",
  siteLogo,
  containerWidth = "standard",
  footerText = "© 2024 MarketPlace Pro. All rights reserved.",
  showSocialLinks = true,
  showNewsletterFooter = true,
  showPaymentMethods = true,
  socialFacebook = "",
  socialTwitter = "",
  socialInstagram = "",
  socialLinkedin = "",
  socialYoutube = "",
  socialTiktok = "",
}: FooterProps) {
  // Dynamic container class based on settings
  const getContainerClass = () => {
    switch (containerWidth) {
      case "wide":
        return "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
      case "full":
        return "w-full px-4 sm:px-6 lg:px-8";
      default: // 'standard'
        return "container";
    }
  };

  const containerClass = getContainerClass();
  return (
    <footer className="bg-muted/50 border-t">
      <div className={`${containerClass} py-12`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {siteLogo?.url ? (
                <img
                  src={siteLogo.url}
                  alt={siteLogo.alt}
                  className="h-8 w-auto"
                />
              ) : (
                <Store className="h-6 w-6 text-primary" />
              )}
              <span className="text-xl font-bold">{siteName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted e-commerce marketplace connecting customers with
              quality vendors worldwide.
            </p>
            {showSocialLinks && (
              <div className="flex gap-4">
                {socialFacebook && (
                  <Link
                    href={socialFacebook}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Facebook className="h-5 w-5" />
                  </Link>
                )}
                {socialTwitter && (
                  <Link
                    href={socialTwitter}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Twitter className="h-5 w-5" />
                  </Link>
                )}
                {socialInstagram && (
                  <Link
                    href={socialInstagram}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Instagram className="h-5 w-5" />
                  </Link>
                )}
                {socialLinkedin && (
                  <Link
                    href={socialLinkedin}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                )}
                {socialYoutube && (
                  <Link
                    href={socialYoutube}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Youtube className="h-5 w-5" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-primary"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors"
                  className="text-muted-foreground hover:text-primary"
                >
                  Vendors
                </Link>
              </li>
              <li>
                <Link
                  href="/deals"
                  className="text-muted-foreground hover:text-primary"
                >
                  Deals & Offers
                </Link>
              </li>
              <li>
                <Link
                  href="/new-arrivals"
                  className="text-muted-foreground hover:text-primary"
                >
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-primary"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-muted-foreground hover:text-primary"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-muted-foreground hover:text-primary"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Info</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@marketplace.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>1-800-MARKETPLACE</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Commerce St, Business City</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>{footerText}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-primary">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
