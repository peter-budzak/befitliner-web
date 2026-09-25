import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {isSiteLocale, type SiteLocale, SUPPORT_EMAIL} from '@/lib/seo';
import '../gyms.css';

type PageProps = {params: Promise<{locale: string}> | {locale: string}};
export const metadata: Metadata = {
  title: {absolute: 'Fitliner — next steps'},
  robots: {index: false, follow: false},
};

const copy: Record<SiteLocale, {thanks:string;lead:string;download:string;create:string;createBody:string;payments:string;paymentsBody:string;delivery:string;deliveryBody:string;apple:string;google:string;support:string}> = {
  sk: {thanks:'Ďakujeme. Vaše slobodnejšie fitko sa práve začína.',lead:'Kým k vám dorazí Fitliner modul, môžete si pripraviť celú digitálnu prevádzku. Modul dorazí najneskôr do 7 pracovných dní.',download:'1. Stiahnite si Fitliner',create:'2. Vytvorte svoje fitko',createBody:'Otvorte aplikáciu, prejdite do sekcie Gym a pridajte svoju prevádzku.',payments:'3. Nastavte platobnú bránu',paymentsBody:'Pripravte členstvá a online platby ešte pred doručením modulu.',delivery:'4. Počkajte na modul',deliveryBody:'Po doručení ho podľa schémy pripojíte k vstupu. Ak budete čokoľvek potrebovať, sme online 24/7.',apple:'Stiahnuť v App Store',google:'Stiahnuť na Google Play',support:'Kontaktovať podporu'},
  en: {thanks:'Thank you. Your freer gym starts now.',lead:'Prepare your digital operation while the Fitliner module is on its way. It will arrive within 7 business days.',download:'1. Download Fitliner',create:'2. Create your gym',createBody:'Open the app, go to Gym and add your location.',payments:'3. Set up the payment gateway',paymentsBody:'Prepare memberships and online payments before the module arrives.',delivery:'4. Wait for the module',deliveryBody:'Connect it to the entrance using the guide. Our online support is available 24/7.',apple:'Download on the App Store',google:'Get it on Google Play',support:'Contact support'},
  de: {thanks:'Danke. Dein freieres Studio beginnt jetzt.',lead:'Bereite den digitalen Betrieb vor, während das Fitliner Modul unterwegs ist. Es kommt spätestens in 7 Werktagen.',download:'1. Fitliner herunterladen',create:'2. Studio anlegen',createBody:'Öffne die App, gehe zu Gym und füge deinen Standort hinzu.',payments:'3. Zahlungen einrichten',paymentsBody:'Bereite Mitgliedschaften und Online-Zahlungen vor der Lieferung vor.',delivery:'4. Auf das Modul warten',deliveryBody:'Nach der Lieferung gemäß Plan anschließen. Unser Online-Support ist rund um die Uhr da.',apple:'Im App Store laden',google:'Bei Google Play laden',support:'Support kontaktieren'},
  es: {thanks:'Gracias. Tu gimnasio más libre empieza ahora.',lead:'Prepara la operación digital mientras llega el módulo Fitliner, en un máximo de 7 días laborables.',download:'1. Descarga Fitliner',create:'2. Crea tu gimnasio',createBody:'Abre la app, entra en Gym y añade tu centro.',payments:'3. Configura los pagos',paymentsBody:'Prepara membresías y pagos online antes de recibir el módulo.',delivery:'4. Espera el módulo',deliveryBody:'Conéctalo siguiendo el esquema. Nuestro soporte online está disponible 24/7.',apple:'Descargar en App Store',google:'Descargar en Google Play',support:'Contactar soporte'},
  fr: {thanks:'Merci. Votre salle plus libre commence maintenant.',lead:'Préparez l’exploitation numérique pendant l’acheminement du module, livré sous 7 jours ouvrés.',download:'1. Téléchargez Fitliner',create:'2. Créez votre salle',createBody:'Ouvrez l’app, allez dans Gym et ajoutez votre établissement.',payments:'3. Configurez les paiements',paymentsBody:'Préparez abonnements et paiements avant la livraison.',delivery:'4. Attendez le module',deliveryBody:'Branchez-le avec le schéma. Notre assistance en ligne reste disponible 24/7.',apple:'Télécharger sur l’App Store',google:'Télécharger sur Google Play',support:'Contacter le support'},
  'zh-Hans': {thanks:'感谢购买。更自由的健身房运营从现在开始。',lead:'模块运输期间即可完成数字化设置，最迟 7 个工作日送达。',download:'1. 下载 Fitliner',create:'2. 创建健身房',createBody:'打开应用，进入 Gym 并添加您的场馆。',payments:'3. 设置支付网关',paymentsBody:'模块到达前即可准备会籍与在线付款。',delivery:'4. 等待模块送达',deliveryBody:'按接线图连接入口。在线支持全天候为您服务。',apple:'在 App Store 下载',google:'在 Google Play 下载',support:'联系支持'},
};

export default async function GymSuccessPage({params}: PageProps) {
  const {locale} = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = copy[locale];
  return <main className="gym-landing gym-success"><nav className="gym-nav gym-container"><Link className="gym-wordmark" href={`/${locale}`}>FITLINER<span>®</span></Link></nav><section className="gym-section gym-container"><p className="gym-eyebrow"><span />FITLINER</p><h1>{t.thanks}</h1><p className="gym-intro">{t.lead}</p><div className="gym-success-store"><h2>{t.download}</h2><div><a href="https://apps.apple.com/app/id6760855966">{t.apple} ↗</a><a href="https://play.google.com/store/apps/details?id=com.fitliner.app">{t.google} ↗</a></div></div><ol className="gym-onboarding">{[[t.create,t.createBody],[t.payments,t.paymentsBody],[t.delivery,t.deliveryBody]].map(([title,body],index)=><li key={title}><span>0{index+2}</span><h3>{title}</h3><p>{body}</p></li>)}</ol><a className="gym-text-link" href={`mailto:${SUPPORT_EMAIL}`}>{t.support} ↗</a></section></main>;
}
