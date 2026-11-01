import { notFound } from 'next/navigation';
import TrainerStorefront from '../[slug]/storefront';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default function TrainerCustomerAccount() {
  if (process.env.TRAINER_STOREFRONT_ENABLED !== 'true') notFound();
  return <TrainerStorefront accountOnly profile={{slug:'trainers/account',display_name:'Vaše rezervácie a platby',bio:'Prihláste sa e-mailom, ktorý ste použili pri platbe.'}} offers={[]} />;
}
