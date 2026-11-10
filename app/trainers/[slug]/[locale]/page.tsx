import {notFound,permanentRedirect} from 'next/navigation';
import {isTrainerLocale,trainerPath} from '../../trainer-locale';
import {profileMetadata,PublicProfile} from '../public-profile';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string;locale:string}>};
async function route({params}:Props){
  const {slug,locale}=await params;
  if(!isTrainerLocale(locale))notFound();
  if(locale==='sk')permanentRedirect(trainerPath(slug,locale));
  return {slug,locale};
}
export async function generateMetadata(props:Props){const {slug,locale}=await route(props);return profileMetadata(slug,locale);}
export default async function Page(props:Props){return <PublicProfile {...await route(props)}/>;}
