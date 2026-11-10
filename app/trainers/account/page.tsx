import { notFound } from 'next/navigation';
import CustomerHandoff from './customer-handoff';
import TrainerStorefront from '../[slug]/storefront';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function TrainerCustomerAccount({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  if (process.env.TRAINER_STOREFRONT_ENABLED !== 'true') notFound();
  const query=await searchParams;
  if(typeof query.order_id === "string") return <CustomerHandoff orderId={query.order_id} initialLocale={typeof query.lang === "string"?query.lang:""}/>;
  return <TrainerStorefront accountOnly profile={{slug:'trainers/account',display_name:'Vaše rezervácie a platby',bio:'Prihláste sa e-mailom, ktorý ste použili pri platbe.'}} offers={[]} />;
}
