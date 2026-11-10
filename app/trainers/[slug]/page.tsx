import {profileMetadata,PublicProfile} from './public-profile';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){return profileMetadata((await params).slug,'sk');}
export default async function Page({params}:Props){return <PublicProfile slug={(await params).slug} locale="sk"/>;}
