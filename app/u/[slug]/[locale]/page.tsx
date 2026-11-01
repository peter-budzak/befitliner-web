import Page,{publicMetadata} from '@/components/public-profiles/page';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string;locale:string}>};
export async function generateMetadata({params}:Props){const p=await params;return publicMetadata('user',p.slug,p.locale);}
export default async function UserPage({params}:Props){const p=await params;return <Page kind="user" slug={p.slug} language={p.locale}/>;}
