import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Mail, ArrowRight } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="kontakt" className="py-24 bg-brand-dark">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-primary mb-3">
            Kontakt
          </p>
          <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase text-primary-foreground mb-6">
            Lassen Sie uns Ihr<br />
            nächstes Event planen
          </h2>
          <p className="text-primary-foreground/60 max-w-xl mx-auto mb-10 text-lg">
            Kontaktieren Sie uns für eine unverbindliche Beratung.
            Wir freuen uns auf Ihr Projekt.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+491773856637"
              onClick={() => {
                // @ts-ignore
                if (typeof gtag_report_conversion === "function") return gtag_report_conversion("tel:+491773856637");
              }}
            >
              <Button variant="hero" size="lg" className="gap-2 px-8 py-6">
                <Phone className="w-5 h-5" />
                +49 177 385 6637
              </Button>
            </a>
            <a href="mailto:info@eventpro.de">
              <Button variant="hero-outline" size="lg" className="gap-2 px-8 py-6">
                <Mail className="w-5 h-5" />
                E-Mail schreiben
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
