const Footer = () => (
  <footer className="py-12 border-t border-primary/10 relative">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="text-center md:text-left">
        <span className="gold-shimmer text-lg font-heading tracking-widest">BERLINIKE</span>
        <p className="text-foreground/25 text-xs mt-1 font-sans tracking-wider">
          Née au Gendarmenmarkt · Berlin, Deutschland
        </p>
      </div>

      <div className="flex items-center gap-6 text-xs text-foreground/25 font-sans tracking-widest uppercase">
        <a href="/impressum" className="hover:text-primary/50 transition-colors">Impressum</a>
        <span className="text-primary/20">·</span>
        <span className="italic text-foreground/15">C'est la vie, mon ami.</span>
      </div>

      <div className="text-xs text-foreground/15 font-sans">
        © 2026 BerliNike.ai · Eine Schöpfung von{" "}
        <a href="https://berlinjohn.de" target="_blank" rel="noopener" className="hover:text-primary/40 transition-colors">
          BerlinJohn
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
