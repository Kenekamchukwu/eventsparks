import { useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { EventCard } from "@/components/EventCard";
import { Globe, ChevronLeft } from "lucide-react";
import logo from "@/assets/eventsparks-logo.png";

const fetchEvents = async () => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
};

const EventsByLocation = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const grouped = useMemo(() => {
    const map: Record<string, Record<string, typeof events>> = {};
    events.forEach((event) => {
      const country = event.country || "Unknown";
      const city = event.city || "Unknown";
      if (!map[country]) map[country] = {};
      if (!map[country][city]) map[country][city] = [];
      map[country][city].push(event);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([country, cities]) => ({
        country,
        cities: Object.entries(cities)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([city, events]) => ({ city, events })),
      }));
  }, [events]);

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
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl tracking-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Events by Location
          </h1>
          <p className="text-muted-foreground">Browse African blockchain & tech events by country and city</p>
        </div>

        {isLoading ? (
          <p className="text-center py-20 text-muted-foreground">Loading events...</p>
        ) : grouped.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground">No events found.</p>
        ) : (
          grouped.map(({ country, cities }) => (
            <div key={country} className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  {country}
                </h2>
              </div>
              {cities.map(({ city, events }) => (
                <div key={city} className="mb-8 ml-4 md:ml-8">
                  <h3 className="text-lg font-medium text-muted-foreground mb-4">{city}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default EventsByLocation;
