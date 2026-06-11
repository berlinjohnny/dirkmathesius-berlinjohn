import { useState, useEffect } from "react";
import { X, Mail, Phone, ChevronDown, Sun, Moon } from "lucide-react";
import { portfolio, type PortfolioCategory, type PortfolioImage } from "@/lib/portfolio";
import { Helmet } from "react-helmet-async";
import { imageGalleryJsonLd } from "@/lib/imageJsonLd";

// Per-category cover framing (CSS object-position) — tweak after viewing covers in browser.
const coverPosition: Record<string, string> = {
  sport: "center 35%",
  folks: "center 30%",
  music: "center center",
  reportage: "center 30%",
  landscape: "center center",
  stills: "center 50%",
  publication: "center 25%",
};

const categories = portfolio;
const HERO_FILENAME = "John-Foerster-Akrobat-Sprung-Pfuetze-Wand-Reichstag.webp";
const HERO =
  categories.find((c) => c.id === "sport")?.images.find((i) => i.src.endsWith(HERO_FILENAME))
  ?? categories.find((c) => c.id === "sport")?.images[0]
  ?? categories[0].images[0];

const clients = ["BMW Motorrad", "Red Bull", "adidas", "Stern", "Men's Health", "Amazon", "Heineken", "T-Mobile"];

type Cat = PortfolioCategory;

function Lightbox({ cat, images, index: startIndex, onClose }: { cat: Cat; images: PortfolioImage[]; index: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const current = images[idx];
  return (
    <div className="fixed inset-0 z-50 bg-black/96 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/60 hover:text-white p-2" aria-label="Schließen" onClick={onClose}><X size={24} /></button>
      <button className="absolute left-2 md:left-6 text-white/40 hover:text-white text-4xl px-4 py-8 z-10"
        aria-label="Vorheriges Bild"
        onClick={(e) => { e.stopPropagation(); setIdx(Math.max(0, idx - 1)); }}>‹</button>
      <figure className="flex flex-col items-center gap-3 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <img src={current.src} alt={current.alt} className="max-h-[78vh] max-w-[90vw] object-contain"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        {current.caption && (
          <figcaption className="max-w-3xl px-4 text-center text-sm leading-relaxed text-white/70">
            {current.caption}
          </figcaption>
        )}
      </figure>
      <button className="absolute right-2 md:right-6 text-white/40 hover:text-white text-4xl px-4 py-8 z-10"
        aria-label="Nächstes Bild"
        onClick={(e) => { e.stopPropagation(); setIdx(Math.min(images.length - 1, idx + 1)); }}>›</button>
      <div className="absolute bottom-4 left-0 right-0 px-6 flex flex-col items-center gap-1 text-center" onClick={(e) => e.stopPropagation()}>
        {current.title && <p className="text-white/75 text-sm max-w-xl">{current.title}</p>}
        <span className="text-white/30 text-xs tracking-widest">{idx + 1} / {images.length}</span>
      </div>
    </div>
  );
}

function Gallery({ cat, onClose, dark }: { cat: Cat; onClose: () => void; dark: boolean }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const bg = dark ? "bg-[#080808]" : "bg-[#f8f7f5]";
  const bgBlur = dark ? "bg-[#080808]/92" : "bg-[#f8f7f5]/96";
  const borderC = dark ? "border-white/6" : "border-black/6";
  const headingC = dark ? "text-white" : "text-[#111]";
  const btnC = dark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black";

  return (
    <div className={`fixed inset-0 z-40 ${bg} overflow-y-auto`} role="dialog" aria-label={`${cat.altBase} Portfolio`}>
      <div className={`sticky top-0 z-10 ${bgBlur} backdrop-blur border-b ${borderC} px-6 py-4 flex items-center justify-between`}>
        <h2 className={`font-display text-2xl font-light tracking-wider ${headingC}`}>{cat.label}</h2>
        <button onClick={onClose} className={`${btnC} flex items-center gap-2 text-xs tracking-widest uppercase transition-colors`}>
          <X size={14} /> Zurück
        </button>
      </div>
      <div className="p-3 md:p-5 columns-2 md:columns-3 lg:columns-4 gap-2 md:gap-3">
        {cat.images.map((img, i) => (
          <div key={img.src} className="img-hover mb-2 md:mb-3 cursor-pointer break-inside-avoid"
            onClick={() => setLightbox(i)}>
            <img src={img.src} alt={img.alt} title={img.title ?? img.alt} className="w-full block" loading="lazy" decoding="async"
              onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none"; }} />
            {img.title && (
              <figcaption className={`text-[11px] leading-snug mt-1.5 mb-1 ${dark ? "text-white/45" : "text-black/50"}`}>
                {img.title}
              </figcaption>
            )}
          </div>
        ))}
      </div>
      {lightbox !== null && <Lightbox cat={cat} images={cat.images} index={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

function ContactForm({ dark }: { dark: boolean }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:mail@dirkmathesius.de?subject=Projektanfrage von ${encodeURIComponent(form.name)}&body=${encodeURIComponent(form.message + "\n\nVon: " + form.email)}`;
    setSent(true);
  };

  const inputClass = dark
    ? "bg-transparent border-b border-white/15 focus:border-white/50 outline-none py-3 text-white text-sm placeholder:text-white/25 transition-colors"
    : "bg-transparent border-b border-black/15 focus:border-black/50 outline-none py-3 text-[#111] text-sm placeholder:text-black/25 transition-colors";

  const btnClass = dark
    ? "self-start mt-2 px-8 py-3 border border-white/20 text-white/60 hover:text-white hover:border-white/50 text-xs tracking-[0.2em] uppercase transition-all duration-300"
    : "self-start mt-2 px-8 py-3 border border-black/20 text-black/50 hover:text-black hover:border-black/60 text-xs tracking-[0.2em] uppercase transition-all duration-300";

  if (sent) return <p className={`text-sm ${dark ? "text-white/50" : "text-black/40"}`}>Danke — E-Mail-Client geöffnet.</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
      <input required type="email" placeholder="E-Mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
      <textarea required placeholder="Projekt / Nachricht" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} resize-none`} />
      <button type="submit" className={btnClass}>Senden</button>
    </form>
  );
}

export default function Index() {
  const [activeGallery, setActiveGallery] = useState<Cat | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dm-theme");
    if (saved === "dark") setDark(true);
  }, []);

  const toggleTheme = () => {
    setDark((d) => {
      localStorage.setItem("dm-theme", !d ? "dark" : "light");
      return !d;
    });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (activeGallery) return <Gallery cat={activeGallery} onClose={() => setActiveGallery(null)} dark={dark} />;

  // Color tokens
  const pageBg = dark ? "bg-[#0a0a0a]" : "bg-white";
  const sectionBg = dark ? "bg-[#0a0a0a]" : "bg-white";
  const altBg = dark ? "bg-[#111]" : "bg-[#f8f7f5]";
  const borderC = dark ? "border-white/6" : "border-black/6";
  const headingC = dark ? "text-white" : "text-[#111]";
  const mutedC = dark ? "text-white/35" : "text-black/30";
  const hoverC = dark ? "hover:text-white" : "hover:text-black";
  const navScrollBg = dark
    ? "bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/6"
    : "bg-white/96 backdrop-blur-sm border-b border-black/6";
  const navLinkC = scrolled
    ? (dark ? `${mutedC} ${hoverC}` : "text-black/40 hover:text-black")
    : "text-white/55 hover:text-white";
  const navTitleC = scrolled ? headingC : "text-white";
  const mobileBg = dark ? "bg-[#0a0a0a]" : "bg-white";
  const mobileLinkC = dark ? "text-white/50 hover:text-white" : "text-black/50 hover:text-black";
  const toggleBg = dark ? "text-white/35 hover:text-white" : "text-black/35 hover:text-black";

  return (
    <div className={`min-h-screen ${pageBg} ${headingC} transition-colors duration-300`}>
      {/* Weißer Rahmen / Passepartout — Wiedererkennung dirkmathesius.de */}
      <div aria-hidden className={`pointer-events-none fixed inset-0 z-[60] border-[8px] md:border-[16px] ${dark ? "border-[#0a0a0a]" : "border-white"}`} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(imageGalleryJsonLd)}</script>
      </Helmet>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-5 transition-all duration-400 ${
        scrolled ? navScrollBg : "bg-gradient-to-b from-black/50 to-transparent"
      }`}>
        <span className={`font-display text-lg font-light tracking-[0.2em] transition-colors duration-300 ${navTitleC}`}>
          DIRK MATHESIUS
        </span>
        <div className="hidden md:flex items-center gap-7">
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActiveGallery(c)}
              className={`text-[10px] tracking-[0.4em] uppercase transition-colors duration-300 ${navLinkC}`}>
              {c.label}
            </button>
          ))}
          <a href="#contact" className={`text-[10px] tracking-[0.4em] uppercase transition-colors duration-300 ${navLinkC}`}>
            Info
          </a>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Theme wechseln"
            className={`transition-colors duration-300 ${scrolled ? toggleBg : "text-white/40 hover:text-white"}`}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            className={`md:hidden transition-colors duration-300 ${scrolled ? (dark ? "text-white/50 hover:text-white" : "text-black/50 hover:text-black") : "text-white/60 hover:text-white"}`}
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <span className="text-xs tracking-widest">MENU</span>}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={`fixed inset-0 z-20 ${mobileBg} flex flex-col items-center justify-center gap-8`}>
          {categories.map((c) => (
            <button key={c.id} onClick={() => { setActiveGallery(c); setMenuOpen(false); }}
              className={`font-display text-3xl font-light ${mobileLinkC} transition-colors`}>
              {c.label}
            </button>
          ))}
          <a href="#contact" onClick={() => setMenuOpen(false)}
            className={`font-display text-3xl font-light ${mobileLinkC} transition-colors`}>
            Info
          </a>
        </div>
      )}

      {/* Hero — full-bleed photo, white text always */}
      <section className="relative h-screen flex items-end pb-16 overflow-hidden">
        <img src={HERO.src}
          alt={`${HERO.alt} – Sportfotograf Berlin (BMW Motorrad, Red Bull, adidas)`}
          fetchpriority="high"
          className="absolute inset-0 w-full h-full object-cover" />
        <div className={`absolute inset-0 ${dark ? "bg-gradient-to-t from-black/80 via-black/15 to-black/50" : "bg-gradient-to-t from-black/70 via-black/10 to-black/40"}`} />
        <div className="relative z-10 px-6 md:px-14">
          <p className="text-[10px] tracking-[0.5em] uppercase text-white/40 mb-4">Berlin · Photography</p>
          <h1 className="font-display text-5xl md:text-8xl font-light text-white leading-none mb-3">
            Dirk<br />Mathesius
          </h1>
          <p className="text-white/40 text-sm tracking-widest">
            Sport · People · Music · Reportage · Landscape · Stills
          </p>
          <p className="text-white/35 text-[11px] tracking-[0.3em] uppercase mt-4">
            Fotograf in Berlin · seit 1997 · 30+ Jahre Erfahrung
          </p>
        </div>
        <a href="#portfolio" className="absolute bottom-8 right-8 text-white/25 hover:text-white/70 transition-colors">
          <ChevronDown size={22} />
        </a>
      </section>

      {/* Portfolio Grid */}
      <section id="portfolio" className={`p-1 md:p-2 ${altBg}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveGallery(cat)}
              aria-label={`${cat.label} Portfolio öffnen`}
              className="img-hover relative cursor-pointer group overflow-hidden" style={{ aspectRatio: "1/1" }}>
              <img src={cat.cover} alt={cat.coverAlt} className="w-full h-full object-cover" loading="lazy"
                style={{ objectPosition: coverPosition[cat.id] ?? "center center" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all duration-500" />
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] tracking-[0.4em] uppercase text-white/90">{cat.label}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Clients */}
      <section className={`px-6 py-16 border-t ${borderC} ${sectionBg}`}>
        <p className={`text-[10px] tracking-[0.5em] uppercase ${mutedC} text-center mb-10`}>Ausgewählte Kunden</p>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
          {clients.map((c) => (
            <span key={c} className={`text-sm ${mutedC} tracking-wider ${hoverC} transition-colors cursor-default`}>
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* About — minimal SEO paragraph */}
      <section className={`px-6 md:px-12 py-14 border-t ${borderC} ${sectionBg}`}>
        <p className={`text-[10px] tracking-[0.5em] uppercase ${mutedC} mb-5`}>Über</p>
        <p className={`text-sm ${dark ? "text-white/45" : "text-black/45"} leading-relaxed max-w-lg`}>
          Dirk Mathesius ist Fotograf in Berlin und seit 1997 aktiv — über 30 Jahre Erfahrung in Sportfotografie, Portraitfotografie, Musikfotografie und Editorial Photography. Kunden: BMW Motorrad, Red Bull, adidas, Stern, Men's Health, Amazon, Heineken, T-Mobile.
        </p>
      </section>

      {/* Contact */}
      <section id="contact" className={`px-6 md:px-12 py-20 border-t ${borderC} ${altBg} max-w-xl`}>
        <p className={`text-[10px] tracking-[0.5em] uppercase ${mutedC} mb-6`}>Kontakt</p>
        <h2 className={`font-display text-4xl md:text-5xl font-light ${headingC} mb-8`}>Projekt anfragen</h2>
        <address className="not-italic flex flex-col gap-4 mb-10">
          <a href="tel:+491755915670" className={`flex items-center gap-3 ${mutedC} ${hoverC} transition-colors text-sm`}>
            <Phone size={14} /> +49 175 591 5670
          </a>
          <a href="mailto:mail@dirkmathesius.de" className={`flex items-center gap-3 ${mutedC} ${hoverC} transition-colors text-sm`}>
            <Mail size={14} /> mail@dirkmathesius.de
          </a>
          <p className={`${mutedC} text-xs mt-1`}>Bahrendorfer Str. 22 · 12555 Berlin</p>
        </address>
        <ContactForm dark={dark} />
      </section>

      {/* Footer */}
      <footer className={`px-6 py-8 border-t ${borderC} ${sectionBg} flex flex-col md:flex-row items-center justify-between gap-3`}>
        <span className={`text-xs ${mutedC} tracking-widest`}>© 2026 DIRK MATHESIUS</span>
        <div className="flex items-center gap-6">
          <a href="/impressum.html" className={`text-xs ${mutedC} ${hoverC} transition-colors tracking-widest`}>
            IMPRESSUM
          </a>
          <a href="/datenschutzerklaerung.html" className={`text-xs ${mutedC} ${hoverC} transition-colors tracking-widest`}>
            DATENSCHUTZ
          </a>
          <a href="https://www.dirkmathesius.de" target="_blank" rel="noopener noreferrer"
            className={`text-xs ${mutedC} ${hoverC} transition-colors tracking-widest`}>
            DIRKMATHESIUS.DE
          </a>
        </div>
      </footer>
    </div>
  );
}
