import { useState } from "react";
import { X } from "lucide-react";
import { portfolio, type PortfolioCategory, type PortfolioImage } from "@/lib/portfolio";
import { Helmet } from "react-helmet-async";
import { imageGalleryJsonLd } from "@/lib/imageJsonLd";

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

// Featured hero photo (John-Förster, Reichstag-Sprung)
const HERO_FILENAME = "John-Foerster-Akrobat-Sprung-Pfuetze-Wand-Reichstag.webp";
const HERO =
  categories.find((c) => c.id === "sport")?.images.find((i) => i.src.endsWith(HERO_FILENAME))
  ?? categories.find((c) => c.id === "sport")?.images[0]
  ?? categories[0].images[0];

// Reihenfolge wie im Original
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

function Lightbox({ images, index: startIndex, onClose }: { images: PortfolioImage[]; index: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const current = images[idx];
  return (
    <div className="fixed inset-0 z-50 bg-white/98 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-4 right-4 text-black/50 hover:text-[#FF6600] p-2" aria-label="Schließen" onClick={onClose}><X size={22} /></button>
      <button className="absolute left-2 md:left-6 text-black/30 hover:text-[#FF6600] text-4xl px-4 py-8 z-10"
        aria-label="Vorheriges Bild"
        onClick={(e) => { e.stopPropagation(); setIdx(Math.max(0, idx - 1)); }}>‹</button>
      <figure className="flex flex-col items-center gap-3 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <img src={current.src} alt={current.alt} className="max-h-[80vh] max-w-[90vw] object-contain"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        <figcaption className="max-w-2xl px-4 text-center text-[11px] leading-relaxed text-black/55">
          <span className="text-black/35">{COPY}</span>
          {current.title ? <> · {current.title}</> : null}
          <span className="block mt-1 text-black/30">{idx + 1} / {images.length}</span>
        </figcaption>
      </figure>
      <button className="absolute right-2 md:right-6 text-black/30 hover:text-[#FF6600] text-4xl px-4 py-8 z-10"
        aria-label="Nächstes Bild"
        onClick={(e) => { e.stopPropagation(); setIdx(Math.min(images.length - 1, idx + 1)); }}>›</button>
    </div>
  );
}

function Gallery({ cat, onClose }: { cat: PortfolioCategory; onClose: () => void }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-40 bg-white overflow-y-auto" role="dialog" aria-label={`${cat.altBase} Portfolio`}>
      <div className="sticky top-0 z-10 bg-white/96 backdrop-blur border-b border-black/10 px-6 py-3 flex items-center justify-between">
        <h2 className="text-sm tracking-[0.25em] uppercase text-black/80">{cat.label}</h2>
        <button onClick={onClose} className="text-black/40 hover:text-[#FF6600] flex items-center gap-2 text-[11px] tracking-widest uppercase transition-colors">
          <X size={14} /> Zurück
        </button>
      </div>
      <div className="max-w-[1100px] mx-auto p-3 md:p-5 columns-2 md:columns-3 lg:columns-4 gap-2 md:gap-3">
        {cat.images.map((img, i) => (
          <figure key={img.src} className="img-hover mb-2 md:mb-3 cursor-pointer break-inside-avoid"
            onClick={() => setLightbox(i)}>
            <img src={img.src} alt={img.alt} title={img.title ?? img.alt} className="w-full block" loading="lazy" decoding="async"
              onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none"; }} />
            {img.title && (
              <figcaption className="text-[11px] leading-snug mt-1.5 mb-1 text-black/55">
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

  const inputClass = "bg-transparent border-b border-black/20 focus:border-[#FF6600] outline-none py-2 text-black text-[13px] placeholder:text-black/35 transition-colors";

  if (sent) return <p className="text-[12px] text-black/50">Danke — E-Mail-Programm geöffnet.</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto text-left">
      <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
      <input required type="email" placeholder="E-Mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
      <textarea required placeholder="Projekt / Nachricht" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} resize-none`} />
      <button type="submit" className="self-center mt-1 px-7 py-2 border border-black/25 text-black/60 hover:text-white hover:bg-[#FF6600] hover:border-[#FF6600] text-[11px] tracking-[0.2em] uppercase transition-all duration-300">
        Senden
      </button>
    </form>
  );
}

export default function Index() {
  const [activeGallery, setActiveGallery] = useState<PortfolioCategory | null>(null);

  if (activeGallery) return <Gallery cat={activeGallery} onClose={() => setActiveGallery(null)} />;

  const navLink = "text-[11px] uppercase tracking-wide text-black/70 hover:text-[#FF6600] transition-colors px-3 md:px-4 py-2";

  return (
    <div className="min-h-screen bg-white text-black">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(imageGalleryJsonLd)}</script>
      </Helmet>

      <div id="top" className="max-w-[960px] mx-auto px-4 pt-9 pb-10">
        {/* Header — Logo + Wortmarke */}
        <header className="text-center">
          <a href="#top" aria-label="Startseite" className="inline-block">
            <img src="/images/kreuz.jpg" alt="Dirk Mathesius Logo" width={48} height={48}
              className="mx-auto w-12 h-12 object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/favicon.svg"; }} />
          </a>
          <p className="mt-2 text-[13px] tracking-wide text-black/85">
            <span className="text-[#CCCCCC]">©</span> DIRK MATHESIUS FOTOS
          </p>
        </header>

        {/* Navigation — Kategorien öffnen Galerien */}
        <nav className="mt-4 flex flex-wrap items-center justify-center bg-[#f3f3f3]"
          style={{ backgroundImage: "url(/images/navbg.jpg)", backgroundRepeat: "repeat-x" }}>
          {navCategories.map((c) => (
            <button key={c.id} onClick={() => setActiveGallery(c)} className={navLink}>
              {c.label.toLowerCase()}
            </button>
          ))}
          <a href="#info" className={`${navLink} text-[#FF6600] hover:text-[#FF6600]`}>info</a>
        </nav>

        <hr className="border-0 border-t border-black/15 mt-0" />

        {/* Hero — ein großes zentriertes Foto */}
        <figure className="mt-7 img-hover cursor-pointer" onClick={() => {
          const sport = categories.find((c) => c.id === "sport");
          if (sport) setActiveGallery(sport);
        }}>
          <img src={HERO.src}
            alt={`${HERO.alt} – Sportfotograf Berlin (BMW Motorrad, Red Bull, adidas)`}
            fetchPriority="high"
            className="w-full block" />
          <figcaption className="mt-2 text-center text-[11px] text-black/45">
            <span className="text-black/30">{COPY}</span>{HERO.title ? <> · {HERO.title}</> : null}
          </figcaption>
        </figure>

        {/* Kategorie-Übersicht (optimiert: alle Bereiche durchklickbar) */}
        <section className="mt-9 grid grid-cols-2 md:grid-cols-4 gap-2">
          {navCategories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveGallery(cat)}
              aria-label={`${cat.label} ansehen`}
              className="img-hover relative cursor-pointer group overflow-hidden" style={{ aspectRatio: "1/1" }}>
              <img src={cat.cover} alt={cat.coverAlt} className="w-full h-full object-cover" loading="lazy"
                style={{ objectPosition: coverPosition[cat.id] ?? "center center" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              <div className="absolute inset-0 bg-white/0 group-hover:bg-black/25 transition-all duration-500" />
              <span className="absolute bottom-2 left-2 text-[10px] tracking-[0.25em] uppercase text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {cat.label}
              </span>
            </button>
          ))}
        </section>

        <hr className="border-0 border-t border-black/15 mt-10" />

        {/* Info / Kontakt */}
        <section id="info" className="mt-9 text-center">
          <p className="text-sm text-black/85 tracking-wide mb-1">KONTAKT</p>
          <p className="text-[11px] leading-relaxed text-black/55 max-w-xl mx-auto">
            Dirk Mathesius — Fotograf in Berlin, aktiv seit 1997 (30+ Jahre Erfahrung).
            Sport · People · Music · Publication · Landscape · Reportage · Stills.
          </p>
          <p className="text-[11px] leading-relaxed text-black/55 mt-3">
            Bahrendorfer Straße 22 · 12555 Berlin · Mobil{" "}
            <a href="tel:+491755915670" className="text-[#FF6600] hover:underline">+49 175 5915670</a>
          </p>
          <p className="text-[11px] mt-1">
            <a href="mailto:mail@dirkmathesius.de" className="text-[#FF6600] hover:underline">mail@dirkmathesius.de</a>
          </p>

          <div className="mt-8 max-w-xl mx-auto">
            <p className="text-[12px] text-black/70 mb-3">CLIENTS</p>
            <p className="text-[11px] leading-relaxed text-black/45">
              {clients.join(" · ")}
            </p>
          </div>

          <div className="mt-8">
            <ContactForm />
          </div>
        </section>

        <hr className="border-0 border-t border-black/15 mt-10" />

        {/* Footer */}
        <footer className="mt-4 text-center">
          <div className="h-[19px] bg-repeat-x" style={{ backgroundImage: "url(/images/footer.jpg)" }} />
          <div className="mt-4 flex items-center justify-center gap-5 text-[10px] tracking-wide text-black/45">
            <a href="/impressum.html" className="hover:text-[#FF6600] transition-colors">impressum</a>
            <a href="/datenschutzerklaerung.html" className="hover:text-[#FF6600] transition-colors">datenschutzerklärung</a>
            <span>·</span>
            <a href="https://www.dirkmathesius.de" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6600] transition-colors">dirkmathesius.de</a>
          </div>
          <p className="mt-3 text-[10px] text-black/30">© {new Date().getFullYear()} Dirk Mathesius · Berlin</p>
        </footer>
      </div>
    </div>
  );
}
