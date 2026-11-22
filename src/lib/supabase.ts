export const SUPABASE_URL = 'https://picvzxqkacgiyqflhpys.supabase.co'
// Public publishable key. Authorization is enforced by Supabase Auth and RLS policies.
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_K6bP4cu3BnG3UX1Ow8U1JA_Q9PfVXtV'
const TOKEN_KEY = 'aureon_supabase_access_token'
const REFRESH_KEY = 'aureon_supabase_refresh_token'

export type SupabaseUser = { id: string; email?: string; user_metadata?: Record<string, unknown> }
export type ContentItem = {
  id: string; section: string; title: string; slug: string | null; description: string; price: number | null;
  currency: string; brand: string | null; model: string | null; location: string | null; features: Record<string, unknown>;
  image_urls: string[]; availability: string; published: boolean; sort_order: number; contact_label: string;
  contact_url: string | null; affiliate_url: string | null; created_at?: string; updated_at?: string;
}
export function getAccessToken(){ if(typeof window==='undefined') return ''; return sessionStorage.getItem(TOKEN_KEY)||'' }
function saveSession(data:any){ if(typeof window==='undefined')return; if(data.access_token)sessionStorage.setItem(TOKEN_KEY,data.access_token);if(data.refresh_token)sessionStorage.setItem(REFRESH_KEY,data.refresh_token) }
export function clearSession(){ if(typeof window==='undefined')return;sessionStorage.removeItem(TOKEN_KEY);sessionStorage.removeItem(REFRESH_KEY) }
async function request(path:string,options:RequestInit={},token=''){
 const headers=new Headers(options.headers);headers.set('apikey',SUPABASE_PUBLISHABLE_KEY);headers.set('Content-Type','application/json');if(token)headers.set('Authorization',`Bearer ${token}`);else headers.set('Authorization',`Bearer ${SUPABASE_PUBLISHABLE_KEY}`)
 const response=await fetch(`${SUPABASE_URL}${path}`,{...options,headers});const body=await response.text();let result:any=null;try{result=body?JSON.parse(body):null}catch{result=body}
 if(!response.ok)throw new Error(result?.msg||result?.message||result?.error_description||result?.hint||result?.details||'No se pudo completar la operación con Supabase.')
 return result
}
export async function signIn(email:string,password:string){const data=await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});saveSession(data);return data.user as SupabaseUser}
export async function getCurrentUser(){const token=getAccessToken();if(!token)return null;try{return await request('/auth/v1/user',{},token) as SupabaseUser}catch{clearSession();return null}}
export async function signOut(){const token=getAccessToken();try{if(token)await request('/auth/v1/logout',{method:'POST'},token)}finally{clearSession()}}
export async function getContentItems(publishedOnly=false,authenticated=false){const filter=publishedOnly?'&published=eq.true&availability=neq.draft':'';const token=authenticated?getAccessToken():'';return await request(`/rest/v1/content_items?select=*&order=sort_order.asc,created_at.desc${filter}`,{},token) as ContentItem[]}
export async function saveContentItem(item:Partial<ContentItem> & {id?:string}){
 const token=getAccessToken();if(!token)throw new Error('La sesión ha caducado. Inicia sesión de nuevo.')
 if(item.id){const rows=await request(`/rest/v1/content_items?id=eq.${encodeURIComponent(item.id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({...item,updated_at:new Date().toISOString()})},token);return rows[0] as ContentItem}
 const rows=await request('/rest/v1/content_items',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(item)},token);return rows[0] as ContentItem
}
export function contentItemToEntry(item:ContentItem){
 const map:Record<string,string>={luxury_cars:'coches-en-venta',supercar_rentals:'alquiler-coches',real_estate:'villas-en-venta',investment_opportunities:'oportunidades',villa_rentals:'alquiler-villas',watches_jewelry:'relojes-diamantes-joyas',events:'ocio-vip',offers:'ofertas',affiliate_links:'ofertas',banners:'content',media:'content',courses:'cursos-mentorias',products:'ofertas',family_resources:'content',other:'content'}
 const kind=(typeof item.features?.catalogKind==='string'?item.features.catalogKind:map[item.section])||'content'
 const data:Record<string,any>={description:item.description,price:item.price??undefined,referencePrice:item.features?.referencePrice??undefined,referencePriceSource:item.features?.referencePriceSource??undefined,ownership:item.features?.ownership??undefined,location:item.location||undefined,brand:item.brand||undefined,model:item.model||undefined,images:item.image_urls||[],features:item.features||{},availability:item.availability,offMarket:['sold','unavailable'].includes(item.availability),priceLabel:item.price==null?'':`${new Intl.NumberFormat('es-ES').format(item.price)} ${item.currency||'EUR'}`,contactLabel:item.contact_label,contactUrl:item.contact_url||undefined,affiliateUrl:item.affiliate_url||undefined,url:item.affiliate_url||undefined,section:item.section}
 // Home hero / banners editable from the admin panel: a content item whose features set placement.
 const f=item.features||{};const text=(k:string)=>typeof f[k]==='string'&&String(f[k]).trim()?String(f[k]).trim():undefined
 if(text('placement')){data.placement=text('placement');data.headline=text('headline');data.body=text('body');data.eyebrow=text('eyebrow');data.heroImage=text('heroImage')}
 return {id:item.id,kind,slug:item.slug||item.id,title:item.title,status:item.published&&item.availability!=='draft'?'published':'draft',data}
}
export async function checkAdmin(email:string){const token=getAccessToken();if(!token)return false;const normalized=email.trim().toLowerCase();try{const rows=await request(`/rest/v1/admin_allowlist?email=ilike.${encodeURIComponent(normalized)}&select=email`,{},token);return Array.isArray(rows)&&rows.some((r:any)=>String(r.email).trim().toLowerCase()===normalized)}catch{return false}}

/** Uploads an image selected from the device gallery to the public Aureon catalog bucket. */
export async function uploadCatalogImage(file: File): Promise<string> {
  const token = getAccessToken()
  if (!token) throw new Error('Inicia sesión como administrador antes de subir fotografías.')
  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${crypto.randomUUID()}.${extension}`
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/aureon-catalog/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': file.type || 'image/jpeg',
      'x-upsert': 'false',
    },
    body: file,
  })
  if (!response.ok) {
    let detail = ''
    try { const body = await response.json(); detail = body.message || body.error || '' } catch { /* ignore non-JSON response */ }
    throw new Error(detail || 'Supabase no ha aceptado la fotografía. Comprueba los permisos de almacenamiento.')
  }
  return `${SUPABASE_URL}/storage/v1/object/public/aureon-catalog/${path}`
}

