import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const highlights = [
  "Über 500 erfolgreich durchgeführte Events",
  "Erfahrenes Team aus Eventprofis",
  "Maßgeschneiderte Konzepte für jedes Budget",
  "Deutschlandweites Partnernetzwerk",
];

const AboutSection = () => {
  return (
    <section id="ueber-uns" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-primary mb-3">
              Warum wir
            </p>
            <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase text-foreground mb-6">
              Ihr Partner für<br />
              unvergessliche Events
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Mit jahrelanger Erfahrung in der Eventbranche verstehen wir, worauf es
              ankommt: Präzise Planung, kreative Konzepte und eine makellose
              Umsetzung. Wir arbeiten eng mit Ihrem Team zusammen, um Events zu
              schaffen, die Ihre Unternehmenswerte widerspiegeln.
            </p>
            <ul className="space-y-4">
              {highlights.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-primary/10 rounded-lg p-12 text-center">
              <p className="font-heading text-7xl md:text-8xl font-bold text-primary mb-2">500+</p>
              <p className="font-heading text-xl uppercase tracking-wider text-foreground">
                Erfolgreiche Events
              </p>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-accent rounded-lg p-6 text-center shadow-xl">
              <p className="font-heading text-3xl font-bold text-accent-foreground">98%</p>
              <p className="text-accent-foreground/80 text-sm font-medium">Kundenzufriedenheit</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
