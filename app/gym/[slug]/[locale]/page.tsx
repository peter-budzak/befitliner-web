import Page,{publicMetadata} from '@/components/public-profiles/page';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string;locale:string}>};
export async function generateMetadata({params}:Props){const {slug,locale}=await params;return publicMetadata('gym',slug,locale);}
export default async function GymPage({params}:Props){const {slug,locale}=await params;return <Page kind="gym" slug={slug} language={locale}/>;}
