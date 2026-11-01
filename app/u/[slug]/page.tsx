import Page,{publicMetadata} from '@/components/public-profiles/page';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){return publicMetadata('user',(await params).slug,'sk');}
export default async function UserPage({params}:Props){return <Page kind="user" slug={(await params).slug} language="sk"/>;}
