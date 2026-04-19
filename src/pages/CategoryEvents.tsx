import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { EventCard } from "@/components/EventCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ChevronLeft } from "lucide-react";
import logo from "@/assets/eventsparks-logo.png";

const fetchEventsByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("category", category)
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
};

const CategoryEvents = () => {
  const { category } = useParams<{ category: string }>();
  const decodedCategory = decodeURIComponent(category || "");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", "category", decodedCategory],
    queryFn: () => fetchEventsByCategory(decodedCategory),
    enabled: !!decodedCategory,
  });

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

      <section className="px-4 py-8 md:px-8 max-w-7xl mx-auto">
        <div className="mb-10 flex items-center gap-3">
          <CategoryIcon category={decodedCategory} />
          <div>
            <h1 className="text-3xl md:text-4xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              {decodedCategory} Events
            </h1>
            <p className="text-muted-foreground mt-1">All upcoming {decodedCategory} events across Africa</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center py-20 text-muted-foreground">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground">No {decodedCategory} events found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border/50 px-6 py-8 text-center text-sm text-muted-foreground mt-16">
        <p>© 2026 EventSparks. Africa's blockchain & tech events hub.</p>
      </footer>
    </div>
  );
};

export default CategoryEvents;
