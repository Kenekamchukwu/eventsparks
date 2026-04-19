-- ============================================================
-- EventSparks — Full Database Setup
-- Run this entire file in your Supabase SQL Editor
-- ============================================================


-- ------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------

CREATE TYPE public.app_role AS ENUM ('admin', 'user');


-- ------------------------------------------------------------
-- 2. TABLES
-- ------------------------------------------------------------

-- Events table
CREATE TABLE public.events (
  id          UUID                     NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT                     NOT NULL,
  date        DATE                     NOT NULL,
  time        TIME                     NOT NULL,
  location    TEXT                     NOT NULL,
  description TEXT,
  category    TEXT                     NOT NULL,
  image       TEXT,
  country     TEXT,
  city        TEXT,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id      UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID     REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role    app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id            UUID                     NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT                     NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);


-- ------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ------------------------------------------------------------

ALTER TABLE public.events                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- 4. HELPER FUNCTIONS
-- ------------------------------------------------------------

-- Check if a user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


-- ------------------------------------------------------------
-- 5. RLS POLICIES — events
-- ------------------------------------------------------------

-- Anyone can read events
CREATE POLICY "Anyone can view events"
ON public.events FOR SELECT
USING (true);

-- Open insert/update/delete (UI handles admin auth, not Supabase auth)
CREATE POLICY "Anyone can create events"
ON public.events FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update events"
ON public.events FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete events"
ON public.events FOR DELETE
USING (true);


-- ------------------------------------------------------------
-- 6. RLS POLICIES — user_roles
-- ------------------------------------------------------------

-- Users can only see their own role
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);


-- ------------------------------------------------------------
-- 7. RLS POLICIES — newsletter_subscribers
-- ------------------------------------------------------------

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe"
ON public.newsletter_subscribers FOR INSERT
TO public
WITH CHECK (true);

-- Only admins can view the subscriber list
CREATE POLICY "Admins can view subscribers"
ON public.newsletter_subscribers FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));


-- ------------------------------------------------------------
-- 8. STORAGE — event-images bucket
-- ------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true);

-- Public read access
CREATE POLICY "Event images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- Anyone can upload/update/delete images (UI handles admin auth)
CREATE POLICY "Anyone can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Anyone can update event images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-images');

CREATE POLICY "Anyone can delete event images"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-images');


-- ------------------------------------------------------------
-- 9. MAKE A USER AN ADMIN
-- After signing up, run this with the user's UUID to grant admin:
--
--   INSERT INTO public.user_roles (user_id, role)
--   VALUES ('<your-user-uuid-here>', 'admin');
--
-- Find your UUID in: Supabase Dashboard → Authentication → Users
-- ------------------------------------------------------------
