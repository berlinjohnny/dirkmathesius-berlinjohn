import { motion } from "framer-motion";
import { ShieldCheck, Layers, Building2, Wrench } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const content = {
  de: {
    eyebrow: "Was wir bieten",
    headline: "Unsere Leistungen",
    services: [
      {
        icon: ShieldCheck,
        title: "Sicherheitsräume",
        desc: "Individuelle Sicherheitsräume nach Maß – von der Planung bis zur schlüsselfertigen Übergabe. Verstärkte Wände, zertifizierte Sicherheitstüren und professionelle Haustechnik.",
      },
      {
        icon: Layers,
        title: "Trockenbau",
        desc: "Professioneller Trockenbau für Wohn- und Gewerbeobjekte. Wände, abgehängte Decken und Raumteiler – sauber, effizient und maßgenau ausgeführt.",
      },
      {
        icon: Building2,
        title: "Innenausbau",
        desc: "Kompletter Innenausbau für Privat- und Gewerbeimmobilien. Von der Rohbausanierung bis zur fertigen Raumgestaltung – alles aus einer Hand.",
      },
      {
        icon: Wrench,
        title: "Renovierung & Sanierung",
        desc: "Fachgerechte Renovierung und Sanierung von Bestandsgebäuden. Wir modernisieren Ihre Räume zuverlässig, termingerecht und mit minimaler Beeinträchtigung.",
      },
    ],
  },
  en: {
    eyebrow: "What We Offer",
    headline: "Our Services",
    services: [
      {
        icon: ShieldCheck,
        title: "Security Rooms",
        desc: "Custom security rooms from planning to handover. Reinforced walls, certified security doors and professional building systems – built to your exact requirements.",
      },
      {
        icon: Layers,
        title: "Drywall Construction",
        desc: "Professional drywall for residential and commercial properties. Walls, suspended ceilings and partitions – clean, efficient and precise.",
      },
      {
        icon: Building2,
        title: "Interior Fit-Out",
        desc: "Complete interior construction for private and commercial properties. From shell refurbishment to finished spaces – everything from a single source.",
      },
      {
        icon: Wrench,
        title: "Renovation",
        desc: "Professional renovation and refurbishment of existing buildings. We modernise your spaces reliably, on schedule and with minimal disruption.",
      },
    ],
  },
  ru: {
    eyebrow: "Что мы предлагаем",
    headline: "Наши услуги",
    services: [
      {
        icon: ShieldCheck,
        title: "Комнаты безопасности",
        desc: "Индивидуальные комнаты безопасности под ключ. Армированные стены, сертифицированные бронированные двери и профессиональные инженерные системы.",
      },
      {
        icon: Layers,
        title: "Гипсокартонные работы",
        desc: "Профессиональный монтаж гипсокартона для жилых и коммерческих объектов. Перегородки, подвесные потолки — чисто, эффективно и точно.",
      },
      {
        icon: Building2,
        title: "Внутренняя отделка",
        desc: "Полный комплекс отделочных работ для частных и коммерческих объектов. От черновой отделки до готового помещения — всё из одних рук.",
      },
      {
        icon: Wrench,
        title: "Ремонт и реновация",
        desc: "Профессиональный ремонт и реновация существующих зданий. Модернизируем ваши помещения надёжно, в срок и с минимальными неудобствами.",
      },
    ],
  },
};

export default function ServicesSection() {
  const { lang } = useLang();
  const t = content[lang];

  return (
    <section id="leistungen" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-16">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-primary mb-3">{t.eyebrow}</p>
          <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase text-foreground">{t.headline}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.services.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-card border border-border rounded-lg p-8 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold uppercase tracking-wide text-card-foreground mb-3">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
