// Vercel Edge Function — dynamic OG meta for /event/:id
// Only crawlers are routed here (see vercel.json `has` user-agent rule), so real
// users load the SPA directly via the catch-all rewrite and never hit this.
// This returns per-event OG HTML so WhatsApp/Twitter/etc previews show the event
// image, then meta-refreshes any human who clicks through to the real event page.

export const config = { runtime: "edge" };

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const pathParts = url.pathname.split("/");
  const eventId = pathParts[pathParts.length - 1];

  const siteUrl = process.env.SITE_URL ?? "https://www.eventsparks.xyz";
  const eventUrl = `${siteUrl}/event/${eventId}`;

  // Query Supabase REST API directly and return OG meta HTML
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Server misconfigured", { status: 500 });
  }

  try {
    const apiRes = await fetch(
      `${supabaseUrl}/rest/v1/events?id=eq.${encodeURIComponent(eventId)}&select=id,title,description,image,date,location,category,city,country&limit=1`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const rows = await apiRes.json();
    const event = Array.isArray(rows) ? rows[0] : null;

    if (!event) {
      return new Response("Event not found", { status: 404 });
    }

    const image = event.image ?? `${siteUrl}/favicon.png`;
    const location = [event.city, event.country].filter(Boolean).join(", ") || event.location;
    const rawDesc = event.description
      ? event.description.slice(0, 160)
      : `${event.category} event — ${event.date} · ${location}`;

    const title = escapeHtml(event.title);
    const desc = escapeHtml(rawDesc);
    const safeImage = escapeHtml(image);
    const safeEventUrl = escapeHtml(eventUrl);

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${title} — EventSparks</title>
    <meta name="description" content="${desc}" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="EventSparks" />
    <meta property="og:url" content="${safeEventUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@EventSparks" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${safeImage}" />

    <meta http-equiv="refresh" content="0; url=${safeEventUrl}" />
    <link rel="canonical" href="${safeEventUrl}" />
  </head>
  <body>
    <p>Redirecting to <a href="${safeEventUrl}">${title}</a>…</p>
  </body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      },
    });
  } catch (e) {
    console.error("og-meta error:", e);
    return new Response("Failed to load event", { status: 500 });
  }
}
