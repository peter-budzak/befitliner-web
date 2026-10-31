import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
const clean=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
const emailValid=(s:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export async function POST(req:NextRequest){
 const length=Number(req.headers.get('content-length')||0);
 if(length>12000)return NextResponse.json({error:'payload_too_large'},{status:413});
 let input:Record<string,unknown>;
 try{input=await req.json();if(!input||typeof input!=='object'||Array.isArray(input))throw Error('bad');}catch{return NextResponse.json({error:'invalid_json'},{status:400});}
 const country=clean(input.country_code,2).toUpperCase(),name=clean(input.contact_name,120),company=clean(input.company,160),email=clean(input.email,254).toLowerCase(),phone=clean(input.phone,40),experience=clean(input.experience,2000),message=clean(input.message,2000);
 const validCountries=new Set(['PL','CZ','SK','HU','RO','DE','AT','GB','FR','ES','IT','NL','BE','PT','HR','SI','BG','SE','IE']);
 if(!validCountries.has(country)||name.length<2||!emailValid(email)||phone.length<5||experience.length<10||input.privacy_consent!=='yes')return NextResponse.json({error:'invalid_fields'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return NextResponse.json({error:'temporarily_unavailable'},{status:503});
 const db=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
 const {data:application,error}=await db.from('partner_applications').insert({country_code:country,contact_name:name,company,email,phone,experience,message,privacy_accepted_at:new Date().toISOString()}).select('id').single();
 if(error)return NextResponse.json({error:'temporarily_unavailable'},{status:503});
 // Notification is best-effort; a failed email must not lose a saved application.
 const resendKey=process.env.RESEND_API_KEY;
 const sender=process.env.PARTNER_NOTIFICATION_FROM;
 if(resendKey&&sender){
   const subject='Fitliner: Nová partnerská prihláška – '+country;
   const body=['Nová žiadosť o národné partnerstvo Fitliner','ID: '+application.id,'Krajina: '+country,'Meno: '+name,'Firma: '+company,'E-mail: '+email,'Telefón: '+phone,'Skúsenosti: '+experience,'Správa: '+message].join('\\n\\n');
   try{
     const response=await fetch('https://api.resend.com/emails',{
       method:'POST',headers:{Authorization:'Bearer '+resendKey,'Content-Type':'application/json'},
       body:JSON.stringify({from:sender,to:['peter@peterbudzak.com'],reply_to:email,subject,text:body}),
       signal:AbortSignal.timeout(6500)
     });
     if(!response.ok)console.error('Partner notification failed, HTTP',response.status,'application id',application.id);
   }catch{console.error('Partner notification could not be sent, application id',application.id);}
 }else{console.warn('Partner notification not configured, application id',application.id);}
 return NextResponse.json({ok:true},{status:201});
}
