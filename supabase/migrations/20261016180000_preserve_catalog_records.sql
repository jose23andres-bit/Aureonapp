-- Preserve published/catalogue history: admin removes listings by unpublishing, not DELETE.
-- Apply only to the configured Aureon Supabase project after reviewing existing policies.
DROP POLICY IF EXISTS "Admin can delete content" ON public.content_items;
