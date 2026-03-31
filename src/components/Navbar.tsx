import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Leistungen", href: "#leistungen" },
    { label: "Über uns", href: "#ueber-uns" },
    { label: "Kontakt", href: "#kontakt" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/95 backdrop-blur-sm border-b border-foreground/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="/" className="font-heading text-2xl font-bold uppercase tracking-wider text-primary-foreground">
          Event<span className="text-primary">Pro</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-heading text-sm uppercase tracking-widest text-primary-foreground/80 hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a
            href="tel:+491773856637"
            onClick={() => {
              // @ts-ignore
              if (typeof gtag_report_conversion === "function") return gtag_report_conversion("tel:+491773856637");
            }}
          >
            <Button variant="hero" size="sm" className="gap-2">
              <Phone className="w-4 h-4" />
              Jetzt anrufen
            </Button>
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menü öffnen"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-brand-dark border-t border-foreground/10 pb-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-6 py-3 font-heading text-sm uppercase tracking-widest text-primary-foreground/80 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="px-6 pt-2">
            <a
              href="tel:+491773856637"
              onClick={() => {
                // @ts-ignore
                if (typeof gtag_report_conversion === "function") return gtag_report_conversion("tel:+491773856637");
              }}
            >
              <Button variant="hero" size="sm" className="w-full gap-2">
                <Phone className="w-4 h-4" />
                Jetzt anrufen
              </Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
