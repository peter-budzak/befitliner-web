import {notFound} from 'next/navigation';
import TrainerJoin from '@/components/trainer-join';
import {isSiteLocale,pageMetadata} from '@/lib/seo';
import {joinCopy} from '@/lib/trainer-join-copy';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isSiteLocale(locale))return {};const t=joinCopy(locale);return pageMetadata({locale,path:'trainers',title:t.intro,description:t.introBody});}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isSiteLocale(locale))notFound();return <TrainerJoin locale={locale}/>;}
