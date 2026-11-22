import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
const root=process.cwd()
const checks=[
 ['BROLY component exists', 'src/components/broly.tsx'],
 ['BROLY server function exists', 'netlify/functions/broly.mts'],
 ['BROLY database migration exists', 'supabase/migrations/20261018090000_broly_phase1.sql'],
 ['BROLY setup documentation exists', 'BROLY-FASE-1-SETUP.md'],
 ['BROLY UI tests exist', 'src/components/broly.test.tsx'],
 ['BROLY assistant migration exists', 'supabase/migrations/20261018120000_broly_assistant.sql'],
 ['BROLY dragonfly dock exists', 'src/broly/broly-dock.tsx'],
 ['BROLY server tests exist', 'src/broly/broly-server.test.ts'],
]
let failed=false
for(const [label,path] of checks){const ok=existsSync(resolve(root,path));console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed=true}
const app=readFileSync(resolve(root,'src/components/aureon.tsx'),'utf8')
// Server logic lives in netlify/broly-core since phase 2; read it together with the function entry.
const fn=['netlify/functions/broly.mts','netlify/broly-core/supabase.ts','netlify/broly-core/crypto.ts','netlify/broly-core/tools.ts'].map(f=>readFileSync(resolve(root,f),'utf8')).join('\n')
const tools=readFileSync(resolve(root,'netlify/broly-core/tools.ts'),'utf8')
const assistantSql=readFileSync(resolve(root,'supabase/migrations/20261018120000_broly_assistant.sql'),'utf8')
const migration=readFileSync(resolve(root,'supabase/migrations/20261018090000_broly_phase1.sql'),'utf8')
const packageJson=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'))
for(const [label,ok] of [
 ['Existing application route retains BROLY route branch',app.includes("parts[0]==='broly'?<Broly/>")],
 ['Server checks Supabase admin allowlist',fn.includes('admin_allowlist')],
 ['Google token encryption is server-side AES-256-GCM',fn.includes('aes-256-gcm')],
 ['OAuth callback state is signed and expires',fn.includes('BROLY_STATE_SECRET')&&fn.includes('parsed.exp < Date.now()')],
 ['Task and activity tables are created',migration.includes('public.broly_tasks')&&migration.includes('public.broly_activity')],
 ['Test command remains configured',Boolean(packageJson.scripts?.test)],
 ['Dock is mounted next to the existing floating widgets',app.includes('<RadioDock/></div><BrolyDock/>')],
 ['Memory and Google reads require explicit approval',/save_memory[\s\S]{0,200}requiresApproval: true/.test(tools)&&/agenda_summary[\s\S]{0,250}requiresApproval: true/.test(tools)],
 ['No generic command/HTTP tool in the registry',!/name: '(run_command|http_request|send_email|shell)'/.test(tools)],
 ['Premium voice never imitates real people and is disclosed as AI',readFileSync(resolve(root,'netlify/broly-core/voice.ts'),'utf8').includes('No imites a ninguna persona real')&&readFileSync(resolve(root,'src/broly/broly-dock.tsx'),'utf8').includes('generada por IA')],
 ['New BROLY tables have RLS and no client grants',(assistantSql.match(/enable row level security/g)||[]).length===4&&(assistantSql.match(/revoke all/g)||[]).length===4],
]){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed=true}
if(failed)process.exit(1)
console.log('BROLY static verification passed. This does not replace build, browser, OAuth or live Supabase integration tests.')
