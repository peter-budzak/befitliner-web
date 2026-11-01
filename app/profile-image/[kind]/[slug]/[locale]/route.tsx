import {ImageResponse} from 'next/og';
import {getPublicEntity} from '@/lib/public-profiles/data';
import {isGymLocale} from '@/lib/seo';
import {profileCopy} from '@/lib/public-profiles/copy';
import type {EntityKind} from '@/lib/public-profiles/model';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{kind:string;slug:string;locale:string}>}){
 const {kind,slug,locale}=await params;
 const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex'};
 if(!['user','trainer','gym'].includes(kind)||!isGymLocale(locale))return new Response(null,{status:404,headers});
 const p=await getPublicEntity(kind as EntityKind,slug);if(!p)return new Response(null,{status:404,headers});
 let photo:string|null=null;
 if(p.photo)try{
  const r=await fetch(p.photo,{redirect:'error',cache:'no-store',signal:AbortSignal.timeout(4000)});
  if(r.ok&&/^image\/(png|jpeg|webp)$/.test(r.headers.get('content-type')??'')&&r.body){
   const reader=r.body.getReader();const chunks:Uint8Array[]=[];let size=0;
   while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2_000_000){await reader.cancel();throw new Error('Image too large');}chunks.push(value);}
   photo=`data:${r.headers.get('content-type')};base64,${Buffer.concat(chunks).toString('base64')}`;
  }
 }catch{/* Branded text card remains available if the public photo is unavailable. */}
 return new ImageResponse(<div style={{display:'flex',width:'100%',height:'100%',background:'linear-gradient(120deg,#17121f,#38254e)',color:'#f0e8ff',padding:64,fontFamily:'sans-serif',alignItems:'center',gap:50}}>
  <div style={{display:'flex',flexDirection:'column',flex:1}}><div style={{display:'flex',fontSize:25,letterSpacing:8,color:'#c8aaff'}}>FITLINER</div><div style={{display:'flex',fontSize:55,fontWeight:700,marginTop:50}}>{p.name.slice(0,70)}</div><div style={{display:'flex',fontSize:28,color:'#bda9d4',marginTop:20}}>@{p.slug}</div><div style={{display:'flex',fontSize:22,marginTop:40}}>{profileCopy(locale)[p.kind]}</div></div>
  {photo?<img src={photo} alt="" width={350} height={430} style={{objectFit:'cover',borderRadius:32}}/>:<div style={{display:'flex',width:300,height:300,background:'#604080',borderRadius:48,fontSize:130,alignItems:'center',justifyContent:'center'}}>{p.name.slice(0,1).toUpperCase()}</div>}
 </div>,{width:1200,height:630,headers});
}
