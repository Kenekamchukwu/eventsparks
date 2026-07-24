// Temporary diagnostic function — confirms whether Vercel is building/serving
// functions from the /api directory for this project. Safe to delete.
export const config = { runtime: "edge" };

export default function handler(): Response {
  return new Response("pong", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
