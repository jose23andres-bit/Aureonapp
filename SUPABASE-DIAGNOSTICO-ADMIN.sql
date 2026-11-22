-- SOLO LECTURA. No modifica ni borra nada. Ejecutar en Supabase > SQL Editor.
-- 1) ¿La cuenta administradora está confirmada y en la allowlist (sin distinguir mayúsculas)?
select u.email, u.email_confirmed_at is not null as confirmado, u.last_sign_in_at,
       exists (select 1 from public.admin_allowlist a where lower(a.email) = lower(u.email)) as en_allowlist
from auth.users u
where lower(u.email) in (select lower(email) from public.admin_allowlist);
-- 2) Políticas activas de las tablas que usa el panel.
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where (schemaname = 'public' and tablename in ('content_items', 'admin_allowlist'))
   or (schemaname = 'storage' and tablename = 'objects');
-- 3) ¿Existe la función de autorización que usan las políticas?
select n.nspname, p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace where p.proname = 'is_aureon_admin';
