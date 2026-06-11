import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { portfolio, type PortfolioCategory, type PortfolioImage } from "@/lib/portfolio";
import { Helmet } from "react-helmet-async";
import { imageGalleryJsonLd } from "@/lib/imageJsonLd";

const ORANGE = "#FF6600";

// Per-category cover framing (CSS object-position).
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

const NAV_ORDER = ["folks", "sport", "music", "publication", "landscape", "reportage", "stills"];
const navCategories = NAV_ORDER
  .map((id) => categories.find((c) => c.id === id))
  .filter((c): c is PortfolioCategory => Boolean(c));

const clients = [
  "BMW Motorrad", "audible", "Red Bull", "adidas", "Stern", "Men's Health", "Amazon",
  "Heineken", "T-Mobile", "Converse", "Wella", "Jägermeister", "MTV Viacom", "Capital",
  "MADAME", "BVG", "ALBA", "HELIOS Kliniken", "Eurovia Vinci", "Bayer Schering Pharma",
];

const COPY = "© Dirk Mathesius";

/* Marken-USP: das orange Kreuz als gestochener Vektor */
function CrossLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label="Dirk Mathesius Logo">
      <rect width="64" height="64" rx="3" fill={ORANGE} />
      <g stroke="#111111" strokeWidth="13" strokeLinecap="square">
        <line x1="15" y1="15" x2="49" y2="49" />
        <line x1="49" y1="15" x2="15" y2="49" />
      </g>
    </svg>
  );
}

function Lightbox({ images, index: startIndex, onClose }: { images: PortfolioImage[]; index: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const current = images[idx];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIdx((i) => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-white/98 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-5 right-5 text-black/50 hover:text-[#FF6600] p-2" aria-label="Schließen" onClick={onClose}><X size={22} /></button>
      <button className="absolute left-2 md:left-8 text-black/25 hover:text-[#FF6600] text-5xl px-4 py-8 z-10 font-light"
        aria-label="Vorheriges Bild"
        onClick={(e) => { e.stopPropagation(); setIdx(Math.max(0, idx - 1)); }}>‹</button>
      <figure className="flex flex-col items-center gap-4 max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
        <img src={current.src} alt={current.alt} className="max-h-[80vh] max-w-[92vw] object-contain shadow-sm"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        <figcaption className="max-w-2xl px-4 text-center text-[11px] leading-relaxed tracking-wide text-black/55">
          <span className="text-black/35">{COPY}</span>
          {current.title ? <> · {current.title}</> : null}
          <span className="block mt-1 text-black/30">{idx + 1} / {images.length}</span>
        </figcaption>
      </figure>
      <button className="absolute right-2 md:right-8 text-black/25 hover:text-[#FF6600] text-5xl px-4 py-8 z-10 font-light"
        aria-label="Nächstes Bild"
        onClick={(e) => { e.stopPropagation(); setIdx(Math.min(images.length - 1, idx + 1)); }}>›</button>
    </div>
  );
}

function Gallery({ cat, onClose }: { cat: PortfolioCategory; onClose: () => void }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-40 bg-white overflow-y-auto" role="dialog" aria-label={`${cat.altBase} Portfolio`}>
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-black/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CrossLogo size={22} />
          <h2 className="text-[13px] tracking-[0.3em] uppercase text-black/80">{cat.label}</h2>
        </div>
        <button onClick={onClose} className="text-black/40 hover:text-[#FF6600] flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase transition-colors">
          <X size={14} /> Zurück
        </button>
      </div>
      <div className="max-w-[1300px] mx-auto p-4 md:p-7 columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-5">
        {cat.images.map((img, i) => (
          <figure key={img.src} className="img-hover mb-3 md:mb-5 cursor-pointer break-inside-avoid"
            onClick={() => setLightbox(i)}>
            <img src={img.src} alt={img.alt} title={img.title ?? img.alt} className="w-full block" loading="lazy" decoding="async"
              onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none"; }} />
            {img.title && (
              <figcaption className="text-[11px] leading-snug mt-2 mb-1 text-black/55 tracking-wide">
                <span className="text-black/35">{COPY}</span> · {img.title}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      {lightbox !== null && <Lightbox images={cat.images} index={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:mail@dirkmathesius.de?subject=Projektanfrage von ${encodeURIComponent(form.name)}&body=${encodeURIComponent(form.message + "\n\nVon: " + form.email)}`;
    setSent(true);
  };

  const inputClass = "bg-transparent border-b border-black/20 focus:border-[#FF6600] outline-none py-2.5 text-black text-[13px] placeholder:text-black/35 transition-colors";

  if (sent) return <p className="text-[12px] text-black/50">Danke — E-Mail-Programm geöffnet.</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto text-left">
      <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
      <input required type="email" placeholder="E-Mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
      <textarea required placeholder="Projekt / Nachricht" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} resize-none`} />
      <button type="submit" className="self-center mt-1 px-8 py-2.5 bg-[#FF6600] text-white hover:bg-[#e25c00] text-[11px] tracking-[0.2em] uppercase transition-colors">
        Anfrage senden
      </button>
    </form>
  );
}

export default function Index() {
  const [activeGallery, setActiveGallery] = useState<PortfolioCategory | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (activeGallery) return <Gallery cat={activeGallery} onClose={() => setActiveGallery(null)} />;

  const navLink = "text-[11px] uppercase tracking-[0.2em] text-black/60 hover:text-[#FF6600] transition-colors py-1 border-b border-transparent hover:border-[#FF6600]";

  return (
    <div className="min-h-screen bg-white text-black">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(imageGalleryJsonLd)}</script>
      </Helmet>

      {/* Schlanke Sticky-Markenleiste beim Scrollen */}
      <div className={`fixed top-0 left-0 right-0 z-30 flex items-center justify-center gap-3 bg-white/90 backdrop-blur border-b border-black/10 transition-all duration-300 ${scrolled ? "py-2.5 opacity-100" : "opacity-0 -translate-y-full"}`}>
        <CrossLogo size={20} />
        <span className="text-[12px] tracking-[0.35em] uppercase text-black/80">Dirk Mathesius</span>
      </div>

      <div id="top" className="max-w-[1100px] mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-12">
        {/* Brand-Lockup — der optische USP */}
        <header className="text-center">
          <a href="#top" aria-label="Startseite" className="inline-block">
            <CrossLogo size={52} className="mx-auto" />
          </a>
          <h1 className="mt-4 text-[26px] md:text-[34px] tracking-[0.32em] uppercase font-medium leading-none">
            Dirk&nbsp;Mathesius
          </h1>
          <p className="mt-3 text-[10px] md:text-[11px] tracking-[0.45em] uppercase text-black/45">
            Fotografie · Berlin · seit 1997
          </p>
        </header>

        {/* Navigation */}
        <nav className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 border-y border-black/10 py-4">
          {navCategories.map((c) => (
            <button key={c.id} onClick={() => setActiveGallery(c)} className={navLink}>
              {c.label.toLowerCase()}
            </button>
          ))}
          <a href="#info" className={navLink}>info</a>
        </nav>

        {/* Hero — großes, editoriales Foto (vollständig, nicht beschnitten) */}
        <figure className="mt-10 md:mt-12 img-hover cursor-pointer" onClick={() => {
          const sport = categories.find((c) => c.id === "sport");
          if (sport) setActiveGallery(sport);
        }}>
          <img src={HERO.src}
            alt={`${HERO.alt} – Sportfotograf Berlin (BMW Motorrad, Red Bull, adidas)`}
            fetchPriority="high"
            className="w-full block" />
          <figcaption className="mt-3 text-center text-[11px] tracking-wide text-black/45">
            <span className="text-black/30">{COPY}</span>{HERO.title ? <> · {HERO.title}</> : null}
          </figcaption>
        </figure>

        {/* Bereiche */}
        <section className="mt-14 md:mt-20">
          <p className="text-center text-[10px] tracking-[0.45em] uppercase text-black/40 mb-6">Portfolio</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {navCategories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveGallery(cat)}
                aria-label={`${cat.label} ansehen`}
                className="img-hover relative cursor-pointer group overflow-hidden" style={{ aspectRatio: "1/1" }}>
                <img src={cat.cover} alt={cat.coverAlt} className="w-full h-full object-cover" loading="lazy"
                  style={{ objectPosition: coverPosition[cat.id] ?? "center center" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
                <span className="absolute bottom-3 left-3 text-[10px] tracking-[0.3em] uppercase text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {cat.label}
                </span>
                <span className="absolute bottom-3 right-3 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <CrossLogo size={16} />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Info / Kontakt */}
        <section id="info" className="mt-16 md:mt-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-black/20" />
            <span className="text-[10px] tracking-[0.45em] uppercase text-black/45">Kontakt</span>
            <span className="h-px w-8 bg-black/20" />
          </div>
          <p className="text-[13px] leading-relaxed text-black/65 max-w-xl mx-auto">
            Dirk Mathesius — Fotograf in Berlin, aktiv seit 1997, über 30 Jahre Erfahrung.
            Sport · People · Music · Publication · Landscape · Reportage · Stills.
          </p>
          <p className="text-[12px] leading-relaxed text-black/55 mt-4">
            Bahrendorfer Straße 22 · 12555 Berlin · Mobil{" "}
            <a href="tel:+491755915670" className="text-[#FF6600] hover:underline">+49 175 5915670</a>
          </p>
          <p className="text-[12px] mt-1">
            <a href="mailto:mail@dirkmathesius.de" className="text-[#FF6600] hover:underline">mail@dirkmathesius.de</a>
          </p>

          <div className="mt-10 max-w-2xl mx-auto">
            <p className="text-[10px] tracking-[0.45em] uppercase text-black/40 mb-4">Ausgewählte Kunden</p>
            <p className="text-[12px] leading-relaxed text-black/45">
              {clients.join("  ·  ")}
            </p>
          </div>

          <div className="mt-12">
            <ContactForm />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 md:mt-24 pt-7 border-t border-black/10 text-center">
          <CrossLogo size={26} className="mx-auto" />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[10px] tracking-[0.15em] uppercase text-black/45">
            <a href="/impressum.html" className="hover:text-[#FF6600] transition-colors">Impressum</a>
            <a href="/datenschutzerklaerung.html" className="hover:text-[#FF6600] transition-colors">Datenschutz</a>
            <a href="https://www.dirkmathesius.de" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6600] transition-colors">dirkmathesius.de</a>
          </div>
          <p className="mt-3 text-[10px] tracking-wide text-black/30">© {new Date().getFullYear()} Dirk Mathesius · Berlin</p>
        </footer>
      </div>
    </div>
  );
}
