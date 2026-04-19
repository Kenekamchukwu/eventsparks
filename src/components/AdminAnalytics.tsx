import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Globe, Tag, CalendarDays } from "lucide-react";

type Event = {
  id: string;
  title: string;
  category: string;
  country: string | null;
  city: string | null;
  date: string;
};

interface AdminAnalyticsProps {
  events: Event[];
  subscriberCount: number;
}

export const AdminAnalytics = ({ events, subscriberCount }: AdminAnalyticsProps) => {
  // Popular categories
  const categoryCounts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Events by country
  const countryCounts = events.reduce<Record<string, number>>((acc, e) => {
    const c = e.country || "Unknown";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Upcoming vs past
  const now = new Date().toISOString().split("T")[0];
  const upcoming = events.filter((e) => e.date >= now).length;
  const past = events.length - upcoming;

  const maxCat = topCategories[0]?.[1] || 1;
  const maxCountry = topCountries[0]?.[1] || 1;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Summary cards */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcoming}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.keys(categoryCounts).length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.keys(countryCounts).length}</p>
              <p className="text-xs text-muted-foreground">Countries</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular categories bar chart */}
      <Card className="sm:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Popular Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topCategories.map(([cat, count]) => (
            <div key={cat} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium truncate">{cat}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(count / maxCat) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {topCategories.length === 0 && (
            <p className="text-sm text-muted-foreground">No events yet</p>
          )}
        </CardContent>
      </Card>

      {/* Events by country */}
      <Card className="sm:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Events by Country</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topCountries.map(([country, count]) => (
            <div key={country} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium truncate">{country}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(count / maxCountry) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {topCountries.length === 0 && (
            <p className="text-sm text-muted-foreground">No events yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
