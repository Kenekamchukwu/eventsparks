// Vercel Edge Function — dynamic OG meta for event share links.
// vercel.json rewrites /event/:id -> /api/og?id=:id for every visitor.
// It fetches the real SPA shell (index.html) and injects the event's title,
// description and image as OG/Twitter meta tags, so:
//   - crawlers (WhatsApp/Twitter/Facebook/...) show the event image, and
//   - real users still get the full working React app.
// If anything fails, it returns the unmodified shell so the page never breaks.

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
  const origin = url.origin;
  const eventId = url.searchParams.get("id") ?? "";

  // Always start from the real built SPA shell so the page never breaks.
  const shellRes = await fetch(`${origin}/index.html`);
  let html = await shellRes.text();

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (eventId && supabaseUrl && key) {
      const apiRes = await fetch(
        `${supabaseUrl}/rest/v1/events?id=eq.${encodeURIComponent(
          eventId
        )}&select=title,description,image,date,category,city,country,location&limit=1`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` } }
      );
      const rows = await apiRes.json();
      const event = Array.isArray(rows) ? rows[0] : null;

      if (event && event.image) {
        const siteUrl = process.env.SITE_URL ?? origin;
        const eventUrl = `${siteUrl}/event/${eventId}`;
        const loc =
          [event.city, event.country].filter(Boolean).join(", ") ||
          event.location ||
          "";
        const rawDesc = event.description
          ? String(event.description).slice(0, 160)
          : `${event.category ?? "Event"} — ${event.date ?? ""} · ${loc}`.trim();

        const title = escapeHtml(event.title ?? "EventSparks");
        const desc = escapeHtml(rawDesc);
        const img = escapeHtml(event.image);
        const urlEsc = escapeHtml(eventUrl);

        const tags = `
    <title>${title} — EventSparks</title>
    <meta name="description" content="${desc}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="EventSparks" />
    <meta property="og:url" content="${urlEsc}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:secure_url" content="${img}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${img}" />
  `;

        // Drop the static <title>/description, then inject event-specific tags.
        html = html
          .replace(/<title>[\s\S]*?<\/title>/i, "")
          .replace(/<meta\s+name="description"[^>]*>/i, "")
          .replace(/<\/head>/i, `${tags}</head>`);
      }
    }
  } catch {
    // Swallow — fall through and serve the unmodified shell.
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
