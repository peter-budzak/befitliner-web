const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const os=require('node:os');const ts=require('typescript');
const root=path.resolve(__dirname,'../app/trainers');const out=fs.mkdtempSync(path.join(os.tmpdir(),'fitliner-intent-'));
try{
 for(const file of ['trainer-locale','booking-intent'])fs.writeFileSync(path.join(out,file+'.js'),ts.transpileModule(fs.readFileSync(path.join(root,file+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 fs.copyFileSync(path.join(root,'trainer-copy.json'),path.join(out,'trainer-copy.json'));
 const {parseBookingIntent,bookingCallback,bookingDestination}=require(path.join(out,'booking-intent.js'));
 const input={slug:'peter',offer:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',slot:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',locale:'sk'};
 const callback=new URL(bookingCallback('https://www.befitliner.com',input));
 const parsed=parseBookingIntent(callback.searchParams.get('booking'),callback.searchParams.get('lang'));
 assert.deepEqual(parsed,input);assert.equal(callback.pathname,'/trainers/account');assert(bookingDestination(parsed).startsWith('/peter#offer='));
 for(const slug of ['https://evil.test','//evil.test','account','setup','../peter'])assert.equal(parseBookingIntent(JSON.stringify({...input,slug}),'sk'),null);
 for(const raw of [null,'{','x'.repeat(601),JSON.stringify({...input,offer:'not-an-id'}),JSON.stringify({...input,slot:123})])assert.equal(parseBookingIntent(raw,'sk'),null);
 assert.equal(parseBookingIntent(JSON.stringify(input),'unknown'),null);
 assert(!callback.href.includes('email'));console.log('PASS: cross-browser callback roundtrip, exact local destination and invalid input rejection');
}finally{fs.rmSync(out,{recursive:true,force:true});}
