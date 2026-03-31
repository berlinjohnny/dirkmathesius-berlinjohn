import { motion } from "framer-motion";
import { Calendar, Users, Mic2, MapPin } from "lucide-react";

const services = [
  {
    icon: Calendar,
    title: "Firmenevents",
    description:
      "Von der Planung bis zur Durchführung — maßgeschneiderte Corporate Events für jede Unternehmensgröße.",
  },
  {
    icon: Users,
    title: "Teambuilding",
    description:
      "Innovative Teambuilding-Formate, die Zusammenhalt stärken und nachhaltig wirken.",
  },
  {
    icon: Mic2,
    title: "Konferenzen",
    description:
      "Professionelle Konferenzorganisation mit modernster Technik und reibungslosem Ablauf.",
  },
  {
    icon: MapPin,
    title: "Incentive-Reisen",
    description:
      "Exklusive Reiseprogramme als Belohnung und Motivation für Ihre Top-Performer.",
  },
];

const ServicesSection = () => {
  return (
    <section id="leistungen" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-primary mb-3">
            Was wir bieten
          </p>
          <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase text-foreground">
            Unsere Leistungen
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card border border-border rounded-lg p-8 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold uppercase tracking-wide text-card-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
