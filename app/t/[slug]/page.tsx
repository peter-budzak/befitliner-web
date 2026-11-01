import Page,{publicMetadata} from '@/components/public-profiles/page';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){return publicMetadata('trainer',(await params).slug,'sk');}
export default async function TrainerPage({params}:Props){return <Page kind="trainer" slug={(await params).slug} language="sk"/>;}
