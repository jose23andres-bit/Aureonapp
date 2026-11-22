-- AUREON affiliate catalogue support.
-- Applied to project picvzxqkacgiyqflhpys on 2026-10-16.

ALTER TABLE public.content_items
  DROP CONSTRAINT IF EXISTS content_items_section_check;

ALTER TABLE public.content_items
  ADD CONSTRAINT content_items_section_check CHECK (section IN (
    'luxury_cars', 'supercar_rentals', 'real_estate', 'investment_opportunities',
    'watches_jewelry', 'courses', 'products', 'offers', 'events', 'banners',
    'affiliate_links', 'family_resources', 'media', 'other'
  ));

DROP POLICY IF EXISTS "Admin can upload Aureon catalog" ON storage.objects;
CREATE POLICY "Admin can upload Aureon catalog" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'aureon-catalog' AND private.is_aureon_admin());

DROP POLICY IF EXISTS "Admin can update Aureon catalog" ON storage.objects;
CREATE POLICY "Admin can update Aureon catalog" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'aureon-catalog' AND private.is_aureon_admin())
  WITH CHECK (bucket_id = 'aureon-catalog' AND private.is_aureon_admin());

DROP POLICY IF EXISTS "Admin can delete Aureon catalog" ON storage.objects;
CREATE POLICY "Admin can delete Aureon catalog" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'aureon-catalog' AND private.is_aureon_admin());

DROP POLICY IF EXISTS "Public can view Aureon catalog" ON storage.objects;
CREATE POLICY "Public can view Aureon catalog" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'aureon-catalog');
