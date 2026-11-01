import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../../supabase/functions/partner-application-notify/index.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
async function scenario(mode){
 let handler,calls=0;const row={id:'00000000-0000-4000-8000-000000000001',notification_status:'pending',notification_attempts:0,email:'test@example.com',country_code:'SK'};
 const db={from:()=>{let values=null;const filters=[];const q={select:()=>q,update:v=>(values=v,q),eq:(k,v)=>(filters.push([k,v]),q),single:async()=>({data:{...row},error:null}),maybeSingle:async()=>{if(filters.some(([k,v])=>row[k]!==v))return {data:null,error:null};Object.assign(row,values);return {data:{id:row.id},error:null}},then:(resolve)=>{Object.assign(row,values);resolve({error:null})}};return q}};
 const env={SUPABASE_URL:'https://example.test',SUPABASE_SERVICE_ROLE_KEY:'test-service',MAILERSEND_API_KEY:'test-mail',MAILERSEND_FROM_EMAIL:'test@example.com'};if(mode==='missing')delete env.MAILERSEND_API_KEY;
 const context={exports:{},require:()=>({createClient:()=>db}),Deno:{env:{get:k=>env[k]},serve:fn=>handler=fn},Response,AbortSignal,fetch:async()=>{calls++;if(mode==='timeout')throw Error('timeout');return new Response(null,{status:mode==='reject'?422:mode==='server-error'?500:202,headers:mode==='success'?{'x-message-id':'test-message'}:{}})}};
 vm.runInNewContext(code,context);
 const req=()=>new Request('https://example.test',{method:'POST',headers:{Authorization:'Bearer test-service','Content-Type':'application/json'},body:JSON.stringify({id:row.id})});
 await Promise.all([handler(req()),handler(req())]);
 assert.equal(calls,mode==='missing'?0:1,'atomic claim must prevent duplicate notifications');
 const expected={success:'accepted',timeout:'unknown',reject:'failed','server-error':'unknown',missing:'failed'}[mode];assert.equal(row.notification_status,expected);
 if(['success','timeout','server-error'].includes(mode)){await handler(req());assert.equal(calls,1,'accepted or ambiguous delivery must never auto-resend');}
 if(mode==='reject'){await handler(req());assert.equal(calls,2,'explicitly rejected delivery is retryable');}
 const denied=await handler(new Request('https://example.test',{method:'POST',body:JSON.stringify({id:row.id})}));assert.equal(denied.status,403);
}
for(const mode of ['success','timeout','reject','server-error','missing'])await scenario(mode);
console.log('PASS: notification atomic claim, concurrent calls, accepted deduplication, explicit failure retry, ambiguous failure hold, missing config, authorization. Mock transport only; no email sent.');
