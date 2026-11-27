// Retired: admin event writes now use the signed-in user's JWT and database RLS.
// Deploy this function to replace any older, privileged version still running.
Deno.serve(() => new Response(JSON.stringify({ error: "This endpoint has been retired" }), {
  status: 410,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
}));
