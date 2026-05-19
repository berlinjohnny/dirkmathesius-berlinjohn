import { Link } from "react-router-dom";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-[#080808] text-white px-6 py-16 max-w-2xl mx-auto">
      <Link to="/" className="text-xs text-white/30 hover:text-white/60 tracking-widest uppercase mb-12 block">← Zurück</Link>
      <h1 className="font-display text-4xl font-light mb-12">Impressum</h1>

      <section className="space-y-2 mb-8">
        <h2 className="text-xs tracking-widest uppercase text-white/40 mb-3">Angaben gemäß § 5 TMG</h2>
        <p className="text-white/70">Dirk Mathesius</p>
        <p className="text-white/70">Bahrendorfer Straße 22</p>
        <p className="text-white/70">12555 Berlin</p>
        <p className="text-white/70">Deutschland</p>
      </section>

      <section className="space-y-2 mb-8">
        <h2 className="text-xs tracking-widest uppercase text-white/40 mb-3">Kontakt</h2>
        <p className="text-white/70">Tel: +49 175 591 5670</p>
        <p><a href="mailto:mail@dirkmathesius.de" className="text-white/70 hover:text-white transition-colors">mail@dirkmathesius.de</a></p>
        <p><a href="https://www.dirkmathesius.de" className="text-white/70 hover:text-white transition-colors">www.dirkmathesius.de</a></p>
      </section>

      <section className="space-y-2 mb-8">
        <h2 className="text-xs tracking-widest uppercase text-white/40 mb-3">Umsatzsteuer-ID</h2>
        <p className="text-white/50 text-sm">DE200432530</p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xs tracking-widest uppercase text-white/40 mb-3">Urheberrecht</h2>
        <p className="text-white/40 text-sm leading-relaxed">
          Alle Fotos und Inhalte sind urheberrechtlich geschützt. © Dirk Mathesius. Alle Rechte vorbehalten.
        </p>
      </section>

      <p className="text-white/20 text-xs mt-12 tracking-widest">
        dirkmathesius.berlinjohn.de
      </p>
    </div>
  );
}
