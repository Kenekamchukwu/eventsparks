-- Add registration_link column to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_link TEXT;

-- Make time nullable (we're removing it from the UI but keeping the column)
ALTER TABLE events ALTER COLUMN time DROP NOT NULL;
