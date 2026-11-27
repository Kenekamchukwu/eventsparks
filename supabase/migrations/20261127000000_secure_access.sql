-- This migration replaces ALL existing policies on these three tables.
-- Review and back up existing policies first, especially on shared projects.
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user'
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('events', 'newsletter_subscribers', 'user_roles')
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;

-- Security definer bypasses user_roles RLS to avoid recursive policy evaluation.
-- Its fixed search_path and explicit auth.uid() ensure callers cannot choose an identity.
CREATE OR REPLACE FUNCTION public.is_eventsparks_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (select auth.uid()) AND role = 'admin');
$$;
REVOKE ALL ON FUNCTION public.is_eventsparks_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_eventsparks_admin() TO anon, authenticated;

REVOKE ALL ON public.user_roles FROM anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Events are public" ON public.events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert events" ON public.events FOR INSERT TO authenticated WITH CHECK ((select public.is_eventsparks_admin()));
CREATE POLICY "Admins update events" ON public.events FOR UPDATE TO authenticated USING ((select public.is_eventsparks_admin())) WITH CHECK ((select public.is_eventsparks_admin()));
CREATE POLICY "Admins delete events" ON public.events FOR DELETE TO authenticated USING ((select public.is_eventsparks_admin()));
GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;

REVOKE ALL ON public.newsletter_subscribers FROM anon, authenticated;
GRANT INSERT (email) ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT ON public.newsletter_subscribers TO authenticated;
CREATE POLICY "Public subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING ((select public.is_eventsparks_admin()));

-- Restrictive policies guard this bucket even if older permissive storage policies exist.
-- Policies on other buckets are left intact. Admins also receive permissive write policies.
DROP POLICY IF EXISTS "Event images restrict insert" ON storage.objects;
DROP POLICY IF EXISTS "Event images restrict update" ON storage.objects;
DROP POLICY IF EXISTS "Event images restrict delete" ON storage.objects;
DROP POLICY IF EXISTS "Event images admin insert" ON storage.objects;
DROP POLICY IF EXISTS "Event images admin update" ON storage.objects;
DROP POLICY IF EXISTS "Event images admin delete" ON storage.objects;
CREATE POLICY "Event images restrict insert" ON storage.objects AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (bucket_id <> 'event-images' OR (select public.is_eventsparks_admin()));
CREATE POLICY "Event images restrict update" ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (bucket_id <> 'event-images' OR (select public.is_eventsparks_admin())) WITH CHECK (bucket_id <> 'event-images' OR (select public.is_eventsparks_admin()));
CREATE POLICY "Event images restrict delete" ON storage.objects AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (bucket_id <> 'event-images' OR (select public.is_eventsparks_admin()));
CREATE POLICY "Event images admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'event-images' AND (select public.is_eventsparks_admin()));
CREATE POLICY "Event images admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'event-images' AND (select public.is_eventsparks_admin())) WITH CHECK (bucket_id = 'event-images' AND (select public.is_eventsparks_admin()));
CREATE POLICY "Event images admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'event-images' AND (select public.is_eventsparks_admin()));
