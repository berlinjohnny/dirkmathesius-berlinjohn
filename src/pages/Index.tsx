import { useState, useEffect } from "react";
import { X, Play } from "lucide-react";
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

/* Behind the Scenes — wie die Bilder entstehen (SEO-Alt-Texte) */
const BTS: PortfolioImage[] = [
  {
    src: "/images/bts/bts-foerster-human-flag-behala-hafen-berlin.jpg",
    alt: "Freie Fotokunst, 100% real ohne Bildbearbeitung: Dirk Mathesius in schwebender Hocke und John Förster als Human-Flag am BEHALA-Schild, Berliner Westhafen – Sport- und Konzeptfotografie",
    title: "Human-Flag am BEHALA-Hafen · Freie Arbeit",
  },
  {
    src: "/images/bts/bts-hasselblad-tethered-baustelle-berlin.jpg",
    alt: "Behind the Scenes: Hasselblad-Mittelformatkamera mit dirk-mathesius.de am Set – getethertes Industrie- und Baustellen-Shooting in Berlin",
    title: "Hasselblad am Set · Industrie-Shooting",
  },
  {
    src: "/images/bts/bts-dirk-mathesius-produktfotografie-labor.jpg",
    alt: "Behind the Scenes: Dirk Mathesius bei der Produktfotografie an einem Matest Softmatic Prüfgerät im Labor",
    title: "Produktfotografie im Labor",
  },
  {
    src: "/images/bts/bts-dirk-mathesius-foerster-action-flow-berlin.jpg",
    alt: "Behind the Scenes: Dirk Mathesius in Action mit den Förster-Brüdern – Freerunning- und Sportfotografie in Berlin („Best Flow for Action Photos“)",
    title: "Action-Flow mit den Förster-Brüdern",
  },
  {
    src: "/images/bts/bts-dirk-mathesius-balance-cube-berlin-spree.jpg",
    alt: "Behind the Scenes: Dirk Mathesius in Balance-Pose am Cube Berlin an der Spree, Berlin Hauptbahnhof",
    title: "Balance am Cube Berlin",
  },
  {
    src: "/images/bts/bts-collaboration-foerster-edit-jim-john.jpg",
    alt: "Behind the Scenes: Bildbearbeitung einer Förster-Akrobatik-Aufnahme – Kollaboration mit @jim_john.de und @berlinjohn.de",
    title: "Edit-Collaboration · @jim_john.de",
  },
  {
    src: "/images/bts/bts-foerster-brueder-rauch-action-collab.jpg",
    alt: "Behind the Scenes: Action-Shooting mit den Förster-Brüdern und Dirk Mathesius – Rauch-/Pyro-Effekt und Sprung vor Berliner Wohnarchitektur (@jim_john.de, @dirk_mathesius)",
    title: "Action-Shoot mit Rauch · Förster-Brüder",
  },
  {
    src: "/images/bts/bts-dirk-mathesius-monitor-industrie-hafen.jpg",
    alt: "Behind the Scenes: Live-Monitor mit dirk-mathesius.de bei einem Industrie- und Hafen-Shooting in Berlin",
    title: "Industrie-Shooting · Live-Monitor",
  },
];

/* Original-Logo (oranges Kreuz mit schwarzem Rahmen + www.dirk-mathesius.de) – Marken-USP */
function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <img src="/images/dm-logo.jpg" alt="Dirk Mathesius Logo – www.dirk-mathesius.de"
      width={size} height={size} style={{ width: size, height: size }}
      className={`object-contain ${className}`} loading="eager" decoding="async" />
  );
}

/* === Hero-Bildwechsler: Timeline der Sportmodel-Fotos von John Förster ===
   PLATZHALTER-JAHRE — bitte mit echten Veröffentlichungsjahren ersetzen. */
const TIMELINE_DEF: { file: string; year: number }[] = [
  { file: "John-Foerster-freerunner-Sprung-adidas.webp", year: 2008 },
  { file: "John-Foerster-freerunner-Salto-Treppe-adidas.webp", year: 2009 },
  { file: "John-Foerster-Akrobat-Sprung-Pfuetze-Wand-Reichstag.webp", year: 2010 },
  { file: "John-Foerster-Akrobat-Berliner-Mauer-Stelen.webp", year: 2011 },
  { file: "John-Foerster-Akrobat-Zaun-Supermann.webp", year: 2012 },
  { file: "John-Foerster-Akrobat-Handstand-schwangere-Auster.webp", year: 2013 },
  { file: "John-und-Jim-Förster-Kreuz-Sprung.webp", year: 2014 },
  { file: "John-und-Jim-Förster-holy-Salto-Phaeno.webp", year: 2015 },
  { file: "John-und-Jim-Förster-Fuss-high-five-Phaeno.webp", year: 2016 },
];

type HeroSlide = PortfolioImage & { year: number; cat: PortfolioCategory };
const _allImgs = categories.flatMap((c) => c.images.map((img) => ({ img, cat: c })));
const HERO_SLIDES: HeroSlide[] = TIMELINE_DEF
  .map((t) => {
    const f = _allImgs.find((x) => x.img.src.endsWith(t.file));
    return f ? { ...f.img, year: t.year, cat: f.cat } : null;
  })
  .filter((s): s is HeroSlide => Boolean(s));

function HeroTimeline({ onOpen }: { onOpen: (c: PortfolioCategory) => void }) {
  const start = Math.max(0, HERO_SLIDES.findIndex((s) => s.src.endsWith(HERO_FILENAME)));
  const [i, setI] = useState(start);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || HERO_SLIDES.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  if (HERO_SLIDES.length === 0) return null;
  const s = HERO_SLIDES[i];

  return (
    <section className="mt-10 md:mt-12" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <figure className="relative img-hover cursor-pointer overflow-hidden" onClick={() => onOpen(s.cat)}>
        <img key={s.src} src={s.src}
          alt={`${s.alt} – John Förster, Sportmodel, Sportfotografie Berlin`}
          fetchPriority="high"
          className="w-full block hero-fade" />
        {/* edle Jahresangabe */}
        <div className="absolute left-4 bottom-4 md:left-7 md:bottom-7 text-white pointer-events-none"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.65)" }}>
          <span className="block text-[9px] md:text-[10px] tracking-[0.45em] uppercase text-white/70 mb-1">Sportmodel</span>
          <span className="block text-4xl md:text-6xl font-light tracking-wider leading-none tabular-nums">{s.year}</span>
        </div>
      </figure>
      <figcaption className="mt-3 text-center text-[11px] tracking-wide text-black/45">
        <span className="text-black/30">{COPY}</span>{s.title ? <> · {s.title}</> : null}
      </figcaption>

      {/* Zeitskala — klickbare Jahresangaben */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6 gap-y-1">
        {HERO_SLIDES.map((sl, idx) => (
          <button key={sl.src} onClick={() => setI(idx)} aria-label={`Foto ${sl.year}`}
            className={`relative pb-1 text-[11px] md:text-[12px] tracking-[0.12em] tabular-nums transition-colors ${
              idx === i ? "text-[#FF6600]" : "text-black/35 hover:text-black/70"
            }`}>
            {sl.year}
            {idx === i && <span className="absolute left-0 right-0 -bottom-px h-px bg-[#FF6600]" />}
          </button>
        ))}
      </div>

      {/* Authentizitäts-USP */}
      <p className="mt-5 text-center text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-black/40">
        Freie Fotokunst-Serie · 100&nbsp;% real, ohne Bildbearbeitung · seit 2008
      </p>
    </section>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden lb-fade" onClick={onClose}>
      {/* Hintergrund: dasselbe Bild, stark verschwommen */}
      <img src={current.src} alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl" />
      {/* 90% Scrim — voller Fokus auf das geklickte Bild */}
      <div className="absolute inset-0 bg-black/90" />

      <button className="absolute top-5 right-5 z-20 text-white/70 hover:text-[#FF6600] p-2" aria-label="Schließen" onClick={onClose}><X size={24} /></button>
      <button className="absolute left-2 md:left-8 z-20 text-white/50 hover:text-[#FF6600] text-5xl px-4 py-8 font-light"
        aria-label="Vorheriges Bild"
        onClick={(e) => { e.stopPropagation(); setIdx(Math.max(0, idx - 1)); }}>‹</button>
      <figure className="relative z-10 flex flex-col items-center gap-4 max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
        <img src={current.src} alt={current.alt} className="max-h-[84vh] max-w-[92vw] object-contain shadow-2xl shadow-black/60"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        <figcaption className="max-w-2xl px-4 text-center text-[11px] leading-relaxed tracking-wide text-white/65">
          <span className="text-white/40">{COPY}</span>
          {current.title ? <> · {current.title}</> : null}
          <span className="block mt-1 text-white/30">{idx + 1} / {images.length}</span>
        </figcaption>
      </figure>
      <button className="absolute right-2 md:right-8 z-20 text-white/50 hover:text-[#FF6600] text-5xl px-4 py-8 font-light"
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
          <Logo size={26} />
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

/* Showreel — DSGVO-freundlich: YouTube lädt erst nach Klick (2-Klick, nocookie) */
function Showreel({ id, label = "Showreel" }: { id: string; label?: string }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="relative mx-auto w-full max-w-[300px] aspect-[9/16] bg-black overflow-hidden">
      {play ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
          title={`${label} – Dirk Mathesius`}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button onClick={() => setPlay(true)} aria-label={`${label} abspielen`}
          className="group absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-white">
          <span className="w-16 h-16 rounded-full bg-[#FF6600] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <Play size={26} className="ml-0.5 fill-white" />
          </span>
          <span className="mt-4 text-[10px] tracking-[0.3em] uppercase text-white/75">{label} abspielen</span>
          <span className="absolute bottom-3 left-0 right-0 text-center text-[9px] tracking-wide text-white/40">
            lädt erst nach Klick · YouTube
          </span>
        </button>
      )}
    </div>
  );
}

export default function Index() {
  const [activeGallery, setActiveGallery] = useState<PortfolioCategory | null>(null);
  const [btsLb, setBtsLb] = useState<number | null>(null);
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

      {btsLb !== null && <Lightbox images={BTS} index={btsLb} onClose={() => setBtsLb(null)} />}

      {/* Schlanke Sticky-Markenleiste beim Scrollen */}
      <div className={`fixed top-0 left-0 right-0 z-30 flex items-center justify-center gap-3 bg-white/90 backdrop-blur border-b border-black/10 transition-all duration-300 ${scrolled ? "py-2.5 opacity-100" : "opacity-0 -translate-y-full"}`}>
        <Logo size={24} />
        <span className="text-[12px] tracking-[0.35em] uppercase text-black/80">Dirk Mathesius</span>
      </div>

      <div id="top" className="max-w-[1100px] mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-12">
        {/* Brand-Lockup — der optische USP */}
        <header className="text-center">
          <a href="#top" aria-label="Startseite" className="inline-block">
            <Logo size={96} className="mx-auto" />
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
          <a href="#ueber-dirk" className={navLink}>über dirk</a>
          <a href="#info" className={navLink}>info</a>
        </nav>

        {/* Hero — Bildwechsler/Timeline der Sportmodel-Fotos */}
        <HeroTimeline onOpen={(c) => setActiveGallery(c)} />

        {/* Trust-Badge — dezente Kundenreferenzen */}
        <section className="mt-12 md:mt-16 text-center">
          <p className="text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-black/35 mb-3">Vertraut von</p>
          <p className="text-[11px] md:text-[12px] leading-relaxed text-black/45 max-w-3xl mx-auto">
            {clients.join("  ·  ")}
          </p>
        </section>

        {/* Portfolio — kleine, horizontale Thumbnails zu den Bereichen */}
        <section className="mt-9 md:mt-12">
          <p className="text-center text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-black/30 mb-4">Portfolio</p>
          <div className="flex flex-wrap items-start justify-center gap-3 md:gap-4">
            {navCategories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveGallery(cat)}
                aria-label={`${cat.label} ansehen`} className="group">
                <span className="img-hover block overflow-hidden w-[84px] h-[60px] md:w-[116px] md:h-[78px]">
                  <img src={cat.cover} alt={cat.coverAlt} className="w-full h-full object-cover" loading="lazy"
                    style={{ objectPosition: coverPosition[cat.id] ?? "center center" }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                </span>
                <span className="block mt-1.5 text-[9px] tracking-[0.25em] uppercase text-black/45 group-hover:text-[#FF6600] transition-colors">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Über Dirk — Showreel + Instagram */}
        <section id="ueber-dirk" className="mt-16 md:mt-24">
          <div className="flex items-center justify-center gap-3 mb-7">
            <span className="h-px w-8 bg-black/20" />
            <span className="text-[10px] tracking-[0.45em] uppercase text-black/45">Über Dirk</span>
            <span className="h-px w-8 bg-black/20" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-3xl mx-auto">
            <Showreel id="D5VtZJvNYGY" label="Showreel" />
            <div className="text-center md:text-left">
              <p className="text-[13px] leading-relaxed text-black/65">
                Dirk Mathesius fotografiert seit 1997 in Berlin — Sport, People, Music, Reportage &amp; Editorial.
                Seine Arbeiten erscheinen in führenden Magazinen und Kampagnen
                (BMW Motorrad, Red Bull, adidas, Stern, Men&apos;s Health).
              </p>
              <p className="text-[12px] leading-relaxed text-black/50 mt-3">
                Showreels &amp; Kollaborationen — u.&nbsp;a. mit Sportmodel John Förster (@berlinjohn.de).
              </p>
              <a href="https://www.instagram.com/dirk_mathesius/" target="_blank" rel="noopener noreferrer"
                className="inline-block mt-5 text-[11px] tracking-[0.2em] uppercase text-[#FF6600] hover:underline">
                Mehr Showreels auf Instagram →
              </a>
            </div>
          </div>

          {/* Persönliche Empfehlung & Collaboration (Cross-Marketing) */}
          <figure className="mt-10 md:mt-12 max-w-2xl mx-auto text-center border-t border-black/10 pt-8">
            <blockquote className="text-[14px] md:text-[16px] leading-relaxed text-black/75 italic">
              „Ich arbeite seit Jahren mit Dirk Mathesius — pure, echte Action, ohne Bildbearbeitung.
              Mein klarer Tipp für Sport-, Action- &amp; Editorial-Shootings."
            </blockquote>
            <figcaption className="mt-4 text-[11px] tracking-[0.15em] uppercase text-black/55">
              John Förster · Sportmodel &amp; AcroBerlin ·{" "}
              <a href="https://berlinjohn.de" target="_blank" rel="noopener noreferrer"
                className="text-[#FF6600] hover:underline">berlinjohn.de</a>
            </figcaption>
            <a href="#info"
              className="inline-block mt-6 px-8 py-2.5 bg-[#FF6600] text-white hover:bg-[#e25c00] text-[11px] tracking-[0.2em] uppercase transition-colors">
              Shooting anfragen
            </a>
          </figure>
        </section>

        {/* Behind the Scenes */}
        <section id="behind-the-scenes" className="mt-16 md:mt-24">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="h-px w-8 bg-black/20" />
            <span className="text-[10px] tracking-[0.45em] uppercase text-black/45">Behind the Scenes</span>
            <span className="h-px w-8 bg-black/20" />
          </div>
          <p className="text-center text-[12px] text-black/45 max-w-md mx-auto mb-7">
            Wie die Bilder entstehen — on location, am Set und mit den Förster-Brüdern. 🎬
          </p>
          <div className="columns-2 md:columns-3 gap-3 md:gap-4">
            {BTS.map((img, i) => (
              <figure key={img.src} className="img-hover mb-3 md:mb-4 cursor-pointer break-inside-avoid"
                onClick={() => setBtsLb(i)}>
                <img src={img.src} alt={img.alt} title={img.title} className="w-full block" loading="lazy" decoding="async"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none"; }} />
                {img.title && (
                  <figcaption className="text-[10px] leading-snug mt-1.5 text-black/45 tracking-wide">
                    {img.title}
                  </figcaption>
                )}
              </figure>
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

          <div className="mt-10">
            <ContactForm />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 md:mt-24 pt-7 border-t border-black/10 text-center">
          <Logo size={52} className="mx-auto" />
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
