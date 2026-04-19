import { Link } from "react-router-dom";
import { ChevronLeft, Handshake, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/SocialLinks";
import logo from "@/assets/eventsparks-logo.png";

const BecomeASponsor = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 md:px-10">
        <Link to="/">
          <img src={logo} alt="EventSparks" className="h-10 md:h-12" />
        </Link>
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
      </nav>

      <section className="px-4 py-16 md:px-8 max-w-3xl mx-auto text-center">
        <Handshake className="w-16 h-16 mx-auto text-primary mb-6" />
        <h1 className="text-3xl md:text-5xl tracking-tight mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Become a Sponsor
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Partner with EventSparks to reach Africa's fastest-growing blockchain and tech community. Showcase your brand at top conferences, hackathons, and meetups across the continent.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
          {[
            { title: "Brand Visibility", desc: "Your logo featured on event listings, banners, and promotional materials." },
            { title: "Community Access", desc: "Connect directly with developers, founders, and decision-makers across Africa." },
            { title: "Content Placement", desc: "Sponsored event highlights, newsletters, and social media mentions." },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-2xl border border-border/50 bg-card">
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <Button size="lg" className="gap-2 rounded-full px-8" asChild>
          <a href="mailto:sponsors@eventsparks.com">
            <Mail className="w-4 h-4" /> Contact Us
          </a>
        </Button>
      </section>

      <footer className="border-t border-border/50 px-6 py-8 text-sm text-muted-foreground mt-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
          <p>© 2026 EventSparks. Africa's blockchain & tech events hub.</p>
          <SocialLinks />
        </div>
      </footer>
    </div>
  );
};

export default BecomeASponsor;
