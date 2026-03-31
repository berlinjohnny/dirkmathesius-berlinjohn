import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Eventplanung für Unternehmen | EventPro</title>
        <meta
          name="description"
          content="Professionelle Eventplanung und Veranstaltungsorganisation für Unternehmen. Firmenevents, Teambuilding und Corporate Events aus einer Hand."
        />
        <link rel="canonical" href="https://id-preview--ba6572d6-c11d-4dd3-8090-c1bf80059082.lovable.app/" />
      </Helmet>
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
};

export default Index;
