import 'server-only';
import {cache} from 'react';
import {createClient} from '@supabase/supabase-js';
import {validSlug,safePhoto,type EntityKind,type PublicEntity} from './model';
export function publicProfilesEnabled(){return process.env.FITLINER_PUBLIC_PROFILES_ENABLED==='true';}
export function publicProfileClient(){
 return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}});
}
export const getPublicEntity=cache(async(kind:EntityKind,slug:string):Promise<PublicEntity|null>=>{
 if(!publicProfilesEnabled()||!validSlug(slug))return null;
 const {data,error}=await publicProfileClient().rpc('web_public_entity_v1',{p_kind:kind,p_slug:slug});
 if(error)throw new Error('Public profile service unavailable');
 if(!data)return null;
 // Reconstruct, never spread an untrusted database response into rendered props.
 return {id:String(data.id),scoped:data.scoped===true,kind,slug:String(data.slug),name:String(data.name),bio:typeof data.bio==='string'?data.bio:null,photo:safePhoto(data.photo),photos:Array.isArray(data.photos)?data.photos.slice(0,6).filter((p:unknown)=>typeof p==='string').map((p:string)=>safePhoto(p)).filter((p:string|null):p is string=>p!==null):[],address:typeof data.address==='string'?data.address:null};
});
export async function publicEntities(page:number):Promise<{kind:EntityKind;slug:string;scoped?:boolean}[]> {
 if(!publicProfilesEnabled())return [];
 const {data,error}=await publicProfileClient().rpc('web_public_entities_v1',{p_page:page});
 if(error)throw new Error('Public profile directory unavailable');
 return (data??[]).filter((r:{kind:string;slug:string})=>['user','trainer','gym'].includes(r.kind)&&validSlug(r.slug));
}

export async function publicPageCount():Promise<number>{
 if(!publicProfilesEnabled())return 0;
 const {data,error}=await publicProfileClient().rpc('web_public_page_count_v1');
 if(error)throw new Error('Public profile directory unavailable');
 return Number(data);
}

export const getPublicPosts=cache(async(kind:EntityKind,slug:string)=>{
 if(!publicProfilesEnabled()||!validSlug(slug)||kind==='gym')return [];
 const {data,error}=await publicProfileClient().rpc('web_public_posts_v1',{p_kind:kind,p_slug:slug});
 if(error)throw new Error('Public posts unavailable');
 const {validPostId}=await import('./posts');
 return (Array.isArray(data)?data:[]).slice(0,20).filter(r=>typeof r.id==='string'&&validPostId(r.id)&&typeof r.created_at==='string'&&Number.isFinite(Date.parse(r.created_at))).map(r=>({
  id:r.id as string,createdAt:r.created_at as string,
  image:`/api/public-post-image/${kind}/${slug}/${r.id}`,
  likes:Number.isSafeInteger(r.like_count)&&r.like_count>=0?r.like_count:0,
  comments:Number.isSafeInteger(r.comment_count)&&r.comment_count>=0?r.comment_count:0
 }));
});
