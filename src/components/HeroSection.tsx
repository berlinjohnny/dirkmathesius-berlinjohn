import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-event.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Professionelles Firmenevent mit eleganter Beleuchtung"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="font-heading text-sm md:text-base uppercase tracking-[0.3em] text-primary mb-6">
            Eventplanung für Unternehmen
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold uppercase leading-tight text-primary-foreground mb-6">
            Events, die<br />
            <span className="text-primary">Eindruck</span> hinterlassen
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 font-body font-light">
            Wir konzipieren und realisieren Firmenevents, die Ihre Marke stärken
            und Ihre Mitarbeiter begeistern.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a href="#kontakt">
            <Button variant="hero" size="lg" className="gap-2 px-8 py-6">
              Unverbindlich anfragen
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
          <a href="#leistungen">
            <Button variant="hero-outline" size="lg" className="px-8 py-6">
              Unsere Leistungen
            </Button>
          </a>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
