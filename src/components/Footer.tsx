const Footer = () => {
  return (
    <footer className="bg-brand-dark border-t border-foreground/10 py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-heading text-lg font-bold uppercase tracking-wider text-primary-foreground/80">
          Event<span className="text-primary">Pro</span>
        </p>
        <div className="flex gap-6 text-sm text-primary-foreground/50">
          <a href="/impressum" className="hover:text-primary transition-colors">Impressum</a>
          <a href="/datenschutz" className="hover:text-primary transition-colors">Datenschutz</a>
        </div>
        <p className="text-sm text-primary-foreground/40">
          © {new Date().getFullYear()} EventPro. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
