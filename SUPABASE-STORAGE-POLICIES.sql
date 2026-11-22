-- Ejecutar una sola vez en Supabase > SQL Editor del proyecto AUREON.
-- Permite ver las fotos publicadas, pero solo al administrador autorizado subir,
-- modificar o eliminar imágenes del catálogo.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('aureon-catalog', 'aureon-catalog', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
allowed_mime_types = array['image/jpeg','image/png','image/webp'];

create policy "Public can view Aureon catalog images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'aureon-catalog');

create policy "Aureon admins can upload catalog images"
on storage.objects for insert to authenticated
with check (bucket_id = 'aureon-catalog' and private.is_aureon_admin());

create policy "Aureon admins can update catalog images"
on storage.objects for update to authenticated
using (bucket_id = 'aureon-catalog' and private.is_aureon_admin())
with check (bucket_id = 'aureon-catalog' and private.is_aureon_admin());

create policy "Aureon admins can delete catalog images"
on storage.objects for delete to authenticated
using (bucket_id = 'aureon-catalog' and private.is_aureon_admin());
