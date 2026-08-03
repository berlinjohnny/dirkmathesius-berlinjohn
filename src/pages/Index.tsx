import { useState, useEffect } from "react";
import { X, Play, MessageCircle } from "lucide-react";
import { portfolio, type PortfolioCategory, type PortfolioImage } from "@/lib/portfolio";
import { Helmet } from "react-helmet-async";
import { imageGalleryJsonLd } from "@/lib/imageJsonLd";
import { WEB3FORMS_KEY, EMAIL, PHONE_DISPLAY, PHONE_TEL, whatsappUrl, GA4_ID, IS_OFFICIAL, IS_FANPAGE, OFFICIAL_URL, SITE_URL } from "@/lib/site";
import { trackAnfrageSubmit, trackWhatsappClick, trackAnrufClick, trackCtaClick } from "@/lib/analytics";
import { openCookieSettings } from "@/components/CookieConsent";

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

/* Verkaufstrichter: Ergebnisse · Pakete · FAQ (Inhalte editierbar) */
const CASES = [
  { t: "Sport & Action", d: "Dynamische Sport- und Action-Fotografie — pure, echte Bewegung, ohne Bildbearbeitung. Basis für Vernissagen, Awards & Editorial." },
  { t: "Industrie & Produkt", d: "Mittelformat (Hasselblad), getethert on location — Baustelle, Hafen, Labor. Präzise, authentische Produkt- und Reportagebilder." },
  { t: "People & Editorial", d: "Portraits & Editorial für Magazine und Marken: Stern, Men's Health, audible, BMW Motorrad, Red Bull, adidas." },
];

const BUNDLES = [
  { t: "Action- & Editorial-Kombi", d: "Dynamische Action- und Editorial-Fotografie mit professionellen Sportmodels & Stunts. Echtes Material, ohne Bildbearbeitung.", p: "Preis auf Anfrage" },
  { t: "Industrie & Produkt — on location", d: "Mittelformat-Shooting mobil bei dir vor Ort und im Studio. Tethered, präzise, zuverlässig.", p: "Preis auf Anfrage" },
];

const FAQS = [
  { q: "Wie läuft ein Shooting mit Dirk Mathesius ab?", a: "Kurzes Briefing & Konzept, Terminabstimmung (mobil bei dir vor Ort oder im Studio), Shooting mit komplettem Profi-Equipment, kuratierte Bildauswahl und Lieferung der finalen Bilder." },
  { q: "In welcher Region arbeitest du?", a: "Basis ist Berlin & Umland; deutschlandweit und international auf Anfrage." },
  { q: "Wem gehören die Nutzungsrechte an den Bildern?", a: "Die Nutzungsrechte werden projektbezogen passend zum Einsatz vereinbart. Urheber bleibt © Dirk Mathesius." },
  { q: "Wie schnell bekomme ich die Bilder?", a: "Eine erste Auswahl zeitnah nach dem Shooting; die finale Bearbeitung richtet sich nach Umfang und Absprache." },
  { q: "Was kostet ein Shooting?", a: "Individuell nach Aufwand, Umfang und Nutzungsrechten — du bekommst ein transparentes Angebot auf Anfrage." },
  { q: "Bietet ihr auch Action-/Sportshootings mit Modellen an?", a: "Ja — dynamische Action- und Sportshootings mit professionellen Sportmodels: echte Action, 100 % real, ohne Bildbearbeitung." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

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
    src: "/images/bts/bts-foerster-brueder-rauch-action-collab.jpg",
    alt: "Behind the Scenes: Action-Shooting mit den Förster-Brüdern und Dirk Mathesius – Rauch-/Pyro-Effekt und Sprung vor Berliner Wohnarchitektur (@jim_john.de, @dirk_mathesius)",
    title: "Action-Shoot mit Rauch · Förster-Brüder",
  },
  {
    src: "/images/bts/bts-dirk-mathesius-monitor-industrie-hafen.jpg",
    alt: "Behind the Scenes: Live-Monitor mit dirk-mathesius.de bei einem Industrie- und Hafen-Shooting in Berlin",
    title: "Industrie-Shooting · Live-Monitor",
  },
  {
    src: "/images/bts/bts-gerolsteiner-making-of-freerunner-john-foerster.jpg",
    alt: "Behind the Scenes: Making-of eines Gerolsteiner-Commercials in Berlin – Freerunner John Förster im Salto, Lichtset und Crew im Loft-Studio (Fotografie Dirk Mathesius)",
    title: "Making-of · Gerolsteiner-Commercial",
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
          loading="lazy" decoding="async"
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
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const inputClass = "bg-transparent border-b border-black/20 focus:border-[#FF6600] outline-none py-2.5 text-black text-[13px] placeholder:text-black/35 transition-colors";

  // Fallback ohne Web3Forms-Key: klassisches mailto (funktioniert überall).
  const submitMailto = () => {
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Projektanfrage von " + form.name)}&body=${encodeURIComponent(form.message + "\n\nTelefon: " + form.phone + "\nVon: " + form.email)}`;
    trackAnfrageSubmit("mailto");
    setStatus("ok");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!WEB3FORMS_KEY) return submitMailto();

    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Neue Shooting-Anfrage von ${form.name} · dirkmathesius.de`,
          from_name: form.name,
          name: form.name,
          email: form.email,
          telefon: form.phone,
          message: form.message,
          botcheck: (document.getElementById("dm-botcheck") as HTMLInputElement)?.checked,
        }),
      });
      const data = await res.json();
      if (data.success) {
        trackAnfrageSubmit("web3forms");
        setStatus("ok");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "ok")
    return (
      <p className="text-[13px] text-black/70 leading-relaxed max-w-sm mx-auto">
        Danke für deine Anfrage! 🙌 Dirk meldet sich zeitnah bei dir.
        <br />
        <span className="text-black/45 text-[12px]">
          Schneller geht’s per{" "}
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer"
            onClick={() => trackWhatsappClick("nach-formular")}
            className="text-[#FF6600] hover:underline">WhatsApp</a>{" "}
          oder{" "}
          <a href={`tel:${PHONE_TEL}`} onClick={() => trackAnrufClick("nach-formular")}
            className="text-[#FF6600] hover:underline">Anruf</a>.
        </span>
      </p>
    );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto text-left">
      {/* Honeypot gegen Spam — für Menschen unsichtbar */}
      <input type="checkbox" id="dm-botcheck" name="botcheck" tabIndex={-1} autoComplete="off"
        className="hidden" aria-hidden="true" />
      <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
      <input required type="email" placeholder="E-Mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
      <input type="tel" placeholder="Telefon (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
      <textarea required placeholder="Projekt / Nachricht" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} resize-none`} />
      <button type="submit" disabled={status === "sending"}
        className="self-center mt-1 px-8 py-2.5 bg-[#FF6600] text-white hover:bg-[#e25c00] disabled:opacity-60 text-[11px] tracking-[0.2em] uppercase transition-colors">
        {status === "sending" ? "senden…" : "Anfrage senden"}
      </button>
      {status === "error" && (
        <p className="text-[12px] text-center text-red-600/80">
          Senden fehlgeschlagen. Bitte per{" "}
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a>{" "}
          oder{" "}
          <a href={`mailto:${EMAIL}`} className="underline">E-Mail</a>.
        </p>
      )}
      <p className="text-[10px] text-center text-black/35 leading-relaxed">
        Mit dem Absenden werden deine Angaben zur Bearbeitung der Anfrage verarbeitet
        (Versand via Web3Forms). Details:{" "}
        <a href="/datenschutzerklaerung.html" className="underline hover:text-[#FF6600]">Datenschutz</a>.
      </p>
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

/* Sticky Booking-Leiste — nur mobil. Anfrage-Anker + WhatsApp in EINER Leiste. */
function StickyCta() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t border-black/10 bg-white/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <a href="#info" onClick={() => trackCtaClick("sticky-anfrage")}
        className="flex-1 text-center py-3.5 text-[11px] tracking-[0.2em] uppercase text-white bg-[#FF6600] active:bg-[#e25c00]">
        Shooting anfragen
      </a>
      <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer"
        onClick={() => trackWhatsappClick("sticky")}
        aria-label="WhatsApp"
        className="flex items-center justify-center gap-2 px-6 py-3.5 text-[11px] tracking-[0.12em] uppercase text-white bg-[#25D366] active:bg-[#1eb955]">
        <MessageCircle size={16} /> WhatsApp
      </a>
    </div>
  );
}

/* ── Kollaborations-Blöcke (John × Dirk) — eine Quelle für Fanpage + /kollaborationen ─
   Auf Dirks offizieller Startseite werden sie NICHT gerendert (nur dezent verlinkt). */

/* Behind the Scenes — wie die Bilder entstehen (eigener Lightbox-State) */
function CollabBTS() {
  const [lb, setLb] = useState<number | null>(null);
  return (
    <>
      {lb !== null && <Lightbox images={BTS} index={lb} onClose={() => setLb(null)} />}
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
              onClick={() => setLb(i)}>
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
    </>
  );
}

/* Persönliche Empfehlung von John Förster — nur auf der Fanpage (John feiert die
   Kollaboration); Buchungs-CTA führt auf Dirks offizielle Seite. */
function CollabEndorsement() {
  return (
    <figure className="mt-16 md:mt-24 max-w-2xl mx-auto text-center border-t border-black/10 pt-8">
      <blockquote className="text-[14px] md:text-[16px] leading-relaxed text-black/75 italic">
        „Ich arbeite seit Jahren mit Dirk Mathesius — pure, echte Action, ohne Bildbearbeitung.
        Mein klarer Tipp für Sport-, Action- &amp; Editorial-Shootings."
      </blockquote>
      <figcaption className="mt-4 text-[11px] tracking-[0.15em] uppercase text-black/55">
        John Förster · Sportmodel &amp; AcroBerlin ·{" "}
        <a href="https://berlinjohn.de/?utm_source=dirkmathesius&utm_medium=referral&utm_campaign=netzwerk" target="_blank" rel="noopener noreferrer"
          className="text-[#FF6600] hover:underline">berlinjohn.de</a>
      </figcaption>
      <a href={`${OFFICIAL_URL}/?utm_source=fanpage&utm_medium=referral&utm_campaign=empfehlung`}
        target="_blank" rel="noopener noreferrer"
        onClick={() => trackCtaClick("fanpage-dirk-buchen")}
        className="inline-block mt-6 px-8 py-2.5 bg-[#FF6600] text-white hover:bg-[#e25c00] text-[11px] tracking-[0.2em] uppercase transition-colors">
        Dirk Mathesius buchen →
      </a>
    </figure>
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
        {/* Canonical wird hier zentral gesetzt (aus index.html entfernt, um Doppel-
            Canonical zu vermeiden). Fanpage → official, damit das Ranking bei Dirk
            gebündelt wird; offizielle Seite → eigene URL. */}
        <link rel="canonical" href={(IS_OFFICIAL ? SITE_URL : OFFICIAL_URL) + "/"} />
        <script type="application/ld+json">{JSON.stringify(imageGalleryJsonLd)}</script>
        {IS_OFFICIAL && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
      </Helmet>

      {/* Schlanke Sticky-Markenleiste beim Scrollen */}
      <div className={`fixed top-0 left-0 right-0 z-30 flex items-center justify-center gap-3 bg-white/90 backdrop-blur border-b border-black/10 transition-all duration-300 ${scrolled ? "py-2.5 opacity-100" : "opacity-0 -translate-y-full"}`}>
        <Logo size={24} />
        <span className="text-[12px] tracking-[0.35em] uppercase text-black/80">Dirk Mathesius</span>
      </div>

      <div id="top" className="max-w-[1100px] mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-24 md:pb-12">
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

        {/* Startfoto (Wunsch Dirk Mathesius) — Human-Flag mit Friedenstaube, sein Live-Hero */}
        <figure className="mt-10 md:mt-12 img-hover cursor-pointer overflow-hidden"
          onClick={() => { const c = categories.find((x) => x.id === "sport"); if (c) setActiveGallery(c); }}>
          <img
            src="/images/John-Foerster-Human-Flag-Friedenstaube-Pappeln-Berlin.webp"
            alt="Dirk Mathesius – Startfoto: Sportmodel John Förster in perfekter Human-Flag zwischen mächtigen Pappeln, weiße Friedenstaube auf blauem Shirt – freie Fotokunst, 100 % real, ohne Bildbearbeitung"
            width={1617} height={1212} fetchPriority="high" decoding="async"
            className="w-full block" />
          <figcaption className="mt-3 text-center text-[11px] tracking-wide text-black/45">
            <span className="text-black/30">{COPY}</span> · Human-Flag &amp; Friedenstaube · John Förster
          </figcaption>
        </figure>

        {/* Sportmodel-Serie — Bildwechsler/Timeline. Nur Fanpage; offizielle Seite
            zeigt sie dezent auf /kollaborationen.html. */}
        {IS_FANPAGE && <HeroTimeline onOpen={(c) => setActiveGallery(c)} />}

        {/* Trust-Badge — dezente Kundenreferenzen */}
        <section className="mt-12 md:mt-16 text-center">
          <p className="text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-black/35 mb-3">Vertraut von</p>
          <p className="text-[11px] md:text-[12px] leading-relaxed text-black/45 max-w-3xl mx-auto">
            {clients.join("  ·  ")}
          </p>
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
                (BMW Motorrad, Red Bull, adidas, audible, Stern, Men&apos;s Health).
              </p>
              {IS_OFFICIAL ? (
                <p className="text-[12px] leading-relaxed text-black/50 mt-3">
                  Ausgewählte Kollaborationen &amp; Behind-the-Scenes-Arbeiten:{" "}
                  <a href="/kollaborationen.html" className="text-[#FF6600] hover:underline">Kollaborationen →</a>
                </p>
              ) : (
                <p className="text-[12px] leading-relaxed text-black/50 mt-3">
                  Showreels &amp; Kollaborationen — u.&nbsp;a. mit Sportmodel John Förster (@berlinjohn.de).
                </p>
              )}
              <a href="https://www.instagram.com/dirk_mathesius/" target="_blank" rel="noopener noreferrer"
                className="inline-block mt-5 text-[11px] tracking-[0.2em] uppercase text-[#FF6600] hover:underline">
                Mehr Showreels auf Instagram →
              </a>
            </div>
          </div>

          {/* Empfehlung von John Förster — nur auf der Fanpage */}
          {IS_FANPAGE && <CollabEndorsement />}
        </section>

        {/* Behind the Scenes — nur Fanpage (offizielle Seite: /kollaborationen.html) */}
        {IS_FANPAGE && <CollabBTS />}

        {/* Business-Trichter (Ergebnisse · Pakete · FAQ · Kontakt) — nur auf Dirks
            offizieller Seite. Auf der Fanpage führen Buchungen zu dirkmathesius.de. */}
        {IS_OFFICIAL && (<>
        {/* Ergebnisse / Case Studies */}
        <section id="ergebnisse" className="mt-16 md:mt-24">
          <div className="flex items-center justify-center gap-3 mb-7">
            <span className="h-px w-8 bg-black/20" />
            <span className="text-[10px] tracking-[0.45em] uppercase text-black/45">Ergebnisse</span>
            <span className="h-px w-8 bg-black/20" />
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            {CASES.map((c) => (
              <div key={c.t} className="text-center md:text-left">
                <h3 className="text-[13px] tracking-[0.15em] uppercase text-black/80 mb-2">{c.t}</h3>
                <p className="text-[12px] leading-relaxed text-black/55">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pakete / Kombi-Angebote */}
        <section id="pakete" className="mt-16 md:mt-24">
          <div className="flex items-center justify-center gap-3 mb-7">
            <span className="h-px w-8 bg-black/20" />
            <span className="text-[10px] tracking-[0.45em] uppercase text-black/45">Pakete</span>
            <span className="h-px w-8 bg-black/20" />
          </div>
          <div className="grid md:grid-cols-2 gap-5 md:gap-6 max-w-3xl mx-auto">
            {BUNDLES.map((b) => (
              <div key={b.t} className="border border-black/10 p-6 text-center md:text-left flex flex-col">
                <h3 className="text-[14px] tracking-[0.12em] uppercase text-black/85 mb-2">{b.t}</h3>
                <p className="text-[12px] leading-relaxed text-black/55 flex-1">{b.d}</p>
                <p className="mt-4 text-[11px] tracking-[0.2em] uppercase text-black/45">{b.p}</p>
                <a href="#info" onClick={() => trackCtaClick(`paket-${b.t}`)} className="mt-3 inline-block self-center md:self-start px-7 py-2.5 bg-[#FF6600] text-white hover:bg-[#e25c00] text-[11px] tracking-[0.2em] uppercase transition-colors">
                  Paket anfragen
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-16 md:mt-24 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-7">
            <span className="h-px w-8 bg-black/20" />
            <span className="text-[10px] tracking-[0.45em] uppercase text-black/45">FAQ</span>
            <span className="h-px w-8 bg-black/20" />
          </div>
          <div className="divide-y divide-black/10 border-y border-black/10">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-[13px] text-black/80">
                  <span>{f.q}</span>
                  <span className="text-[#FF6600] shrink-0 transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[12px] leading-relaxed text-black/55">{f.a}</p>
              </details>
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
            <a href={`tel:${PHONE_TEL}`} onClick={() => trackAnrufClick("kontakt")} className="text-[#FF6600] hover:underline">{PHONE_DISPLAY}</a>
          </p>
          <p className="text-[12px] mt-1">
            <a href={`mailto:${EMAIL}`} onClick={() => trackCtaClick("email-kontakt")} className="text-[#FF6600] hover:underline">{EMAIL}</a>
          </p>

          {/* WhatsApp — schnellster Buchungskanal */}
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer"
            onClick={() => trackWhatsappClick("kontakt")}
            className="inline-flex items-center gap-2 mt-6 px-7 py-3 bg-[#25D366] text-white hover:bg-[#1eb955] text-[12px] tracking-[0.12em] uppercase transition-colors">
            <MessageCircle size={16} /> Direkt per WhatsApp anfragen
          </a>
          <p className="mt-3 text-[11px] text-black/40">oder das Formular nutzen:</p>

          <div className="mt-6">
            <ContactForm />
          </div>
        </section>
        </>)}

        {/* Fanpage — klarer Weg zur Buchung auf Dirks offizieller Seite */}
        {IS_FANPAGE && (
          <section id="info" className="mt-16 md:mt-24 text-center">
            <p className="text-[13px] leading-relaxed text-black/65 max-w-xl mx-auto">
              Diese Seite zeigt die Kollaboration mit Sportmodel John Förster.
              Für Buchungen & Anfragen geht es direkt zu Dirk Mathesius:
            </p>
            <a href={`${OFFICIAL_URL}/?utm_source=fanpage&utm_medium=referral&utm_campaign=buchung`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => trackCtaClick("fanpage-zur-offiziellen-seite")}
              className="inline-block mt-6 px-8 py-3 bg-[#FF6600] text-white hover:bg-[#e25c00] text-[11px] tracking-[0.2em] uppercase transition-colors">
              Zu dirkmathesius.de →
            </a>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-16 md:mt-24 pt-7 border-t border-black/10 text-center">
          <Logo size={52} className="mx-auto" />
          {/* Galerien — echte statische Kategorie-Seiten (SEO-Landingpages). Plain <a>, kein SPA-Link. */}
          <nav className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] tracking-[0.2em] uppercase text-black/40">
            <a href="/folks.html" className="hover:text-[#FF6600] transition-colors">People</a>
            <a href="/sport.html" className="hover:text-[#FF6600] transition-colors">Sport</a>
            <a href="/music.html" className="hover:text-[#FF6600] transition-colors">Music</a>
            <a href="/publication.html" className="hover:text-[#FF6600] transition-colors">Publication</a>
            <a href="/landscape.html" className="hover:text-[#FF6600] transition-colors">Landscape</a>
            <a href="/reportage.html" className="hover:text-[#FF6600] transition-colors">Reportage</a>
            <a href="/stills.html" className="hover:text-[#FF6600] transition-colors">Stills</a>
          </nav>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[10px] tracking-[0.15em] uppercase text-black/45">
            <a href="/impressum.html" className="hover:text-[#FF6600] transition-colors">Impressum</a>
            <a href="/datenschutzerklaerung.html" className="hover:text-[#FF6600] transition-colors">Datenschutz</a>
            <a href="https://www.dirkmathesius.de" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6600] transition-colors">dirkmathesius.de</a>
            {GA4_ID && (
              <button onClick={openCookieSettings} className="uppercase hover:text-[#FF6600] transition-colors">Cookie-Einstellungen</button>
            )}
          </div>
          {/* Foto-Schutzhinweis (Wunsch Dirk Mathesius) */}
          <p className="mt-5 max-w-xl mx-auto text-[10px] leading-relaxed text-black/35">
            Die auf dieser Website veröffentlichten Fotos sind rechtlich geschützt. Eine Verwendung,
            Vervielfältigung oder Weitergabe ist nur mit vorheriger Zustimmung zulässig.
          </p>
          <p className="mt-3 text-[10px] tracking-wide text-black/30">© {new Date().getFullYear()} Dirk Mathesius · Berlin</p>
        </footer>
      </div>

      {IS_OFFICIAL && <StickyCta />}
    </div>
  );
}
