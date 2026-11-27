# EventSparks deployment and security

## Important before deploying

The old frontend exposed a Supabase service-role key and admin password. Treat both as compromised. Follow Supabase's current key rotation guidance (legacy JWT signing-key rotation can invalidate other keys and sessions), rotate the admin password, audit database/storage changes and access, and remove exposed credentials from Vercel and other deployments. Revoke/replace affected credentials, including any copies in other deployments. Do not paste keys into Git or chat. A redeploy alone does **not** revoke a previously exposed key.

Changes in this repository do not protect your live project until the database migration is applied and the retired `admin-events` function is deployed or deleted. Restrict access or take the site offline until the migration, credential rotation and function retirement are complete. Back up your database and storage policy definitions first. Test in a staging Supabase project where possible.

## Supabase setup

1. In Supabase Authentication > Users create or invite an admin account. Reset any previously exposed admin password. Copy its user UUID from the dashboard; signing up alone does not make a user an admin.
2. In SQL Editor review and run `supabase/migrations/20261127000000_secure_access.sql` as the project owner. It replaces *all* existing policies for `events`, `newsletter_subscribers`, and `user_roles`. Review for other features that depend on those policies first. Restrictive Storage policies protect writes to `event-images` even where old permissive policies exist; other buckets' existing policies remain in place. Review existing storage policies and your bucket configuration. The migration assumes the existing events and newsletter tables and the `event-images` bucket are present; it does not create them. Don't grant ordinary users privileged database roles or bypass-RLS access.
3. In SQL Editor grant admin access, substituting the real UUID from Authentication > Users (not an email address):

   ```sql
   INSERT INTO public.user_roles (user_id, role)
   SELECT 'YOUR-USER-UUID'::uuid, 'admin'::public.app_role
   WHERE NOT EXISTS (
     SELECT 1 FROM public.user_roles
     WHERE user_id = 'YOUR-USER-UUID'::uuid AND role = 'admin'
   );
   ```

   To revoke access later, delete that user's `admin` row as a database administrator. Policies check the database on each request.
4. Retire the old privileged Edge Function **in the live Supabase project**. Either delete `admin-events` from the dashboard or deploy the replacement in this repository using the Supabase CLI: `supabase login`, `supabase link --project-ref YOUR_PROJECT_REF`, then `supabase functions deploy admin-events`. Deleting it is sufficient: the frontend does not use it. Review any other previously deployed functions or database functions for privileged access. The `og-meta` function has also been escaped in this source; deploy it if you use it.
5. Ensure `event-images` is a public bucket if event images should be publicly visible. Public buckets expose all their objects by URL; do not put private files there. Configure sensible upload size and MIME restrictions in Storage. The chat function remains publicly callable using the public anon key; configure abuse controls/rate limiting and spending limits with your provider, or disable chat if you cannot accept that risk. Its `LOVABLE_API_KEY` belongs only in Supabase Edge Function secrets.
6. In Authentication > URL Configuration, set the Site URL to the production domain and add the production and required preview URLs to the allowed redirect list. Update provider settings as needed. Use HTTPS in production.

## Deploy on Vercel

Vercel must allow deployments on your account: an exhausted free-plan limit may require waiting for its reset or upgrading. These changes do not bypass that limit.

1. Make the changes in this branch available to the Git repository connected to Vercel. Commit/push and merge through your normal workflow if necessary; this workspace does not deploy automatically.
2. In Vercel open the existing project or import the Git repository. Use the Vite framework preset, root directory `.`, install command `npm ci`, build command `npm run build`, and output directory `dist`. Set an appropriate supported Node.js version (e.g. 20 or newer). Explicitly setting `npm ci` avoids selecting Bun from the old Bun lockfiles.
3. Under Project Settings > Environment Variables add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the environments you deploy (Production and, if needed, Preview). Obtain the Project URL and **legacy anon public JWT key** from the Supabase project's API settings. The legacy anon key is used because the current chat function uses it as a bearer token. These values are public by design; never use a service-role key or a secret key as a `VITE_` variable. Remove `VITE_SUPABASE_SERVICE_ROLE_KEY`, `VITE_ADMIN_EMAIL`, and `VITE_ADMIN_PASSWORD` from all Vercel environments, and remove any old sensitive environment variables not needed on the server. `SITE_URL` is optional for the Vercel event-preview function; set it to the canonical domain if desired.
4. Deploy the updated branch, or merge and deploy the production branch. Environment changes require a new deployment. The existing `vercel.json` supplies SPA routing and event-specific social previews via `api/og.ts`; the function now uses the public anon key with the public events read policy.
5. Test in an incognito browser: public event browsing, direct event URLs and refresh, newsletter signup (without exposing subscriber lists), chat, and event-sharing preview. Sign in at `/admin` with the Supabase admin account and test create/edit/delete plus image upload and subscriber viewing. Verify that an anonymous user and an ordinary signed-in user cannot write events, upload/delete images, read subscribers, assign roles, or call the retired endpoint. Verify requests directly against Supabase APIs, not just via hidden UI controls. Test against staging data first.
6. In Vercel Settings > Domains, add the custom domain and configure DNS as instructed there. Once HTTPS is working, update Supabase Auth's site and redirect URLs for that domain. Redeploy after changes to build-time environment values.

Security controls depend on the deployed Supabase policies, storage settings, and functions—not on the frontend UI. Review other existing policies/functions and monitor for abuse; the migration cannot audit deployed resources that are not in this repository.
