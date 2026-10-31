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
 const {error}=await db.from('partner_applications').insert({country_code:country,contact_name:name,company,email,phone,experience,message,privacy_accepted_at:new Date().toISOString()});
 if(error)return NextResponse.json({error:'temporarily_unavailable'},{status:503});
 return NextResponse.json({ok:true},{status:201});
}
