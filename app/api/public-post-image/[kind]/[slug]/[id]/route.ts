import {publicProfileClient,publicProfilesEnabled} from '@/lib/public-profiles/data';
import {validSlug} from '@/lib/public-profiles/model';
import {validPostId} from '@/lib/public-profiles/posts';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store, max-age=0','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex'};
export async function GET(_request:Request,{params}:{params:Promise<{kind:string;slug:string;id:string}>}){
 const {kind,slug,id}=await params;
 if(!publicProfilesEnabled()||!['user','trainer'].includes(kind)||!validSlug(slug)||!validPostId(id))return new Response(null,{status:404,headers});
 const client=publicProfileClient();
 const {data,error}=await client.rpc('web_public_posts_v1',{p_kind:kind,p_slug:slug,p_post:id});
 if(error)return new Response(null,{status:503,headers});
 const path=data?.[0]?.image_path;
 if(typeof path!=='string'||data?.[0]?.id!==id)return new Response(null,{status:404,headers});
 // Anonymous Storage RLS independently rechecks publication and author visibility.
 const image=await client.storage.from('feed-images').download(path);
 if(image.error||!image.data)return new Response(null,{status:404,headers});
 if(!['image/png','image/jpeg'].includes(image.data.type)||image.data.size>3145728)return new Response(null,{status:404,headers});
 return new Response(image.data,{headers:{...headers,'Content-Type':image.data.type}});
}
