import '../[slug]/storefront.css';
import Link from 'next/link';
export const metadata = {title:'Dokonči prepojenie Stripe',robots:{index:false,follow:false}};
export default function TrainerSetupReturn() {
  const appUrl = process.env.TRAINER_APP_RETURN_URL === 'befitliner-staging://' ? 'befitliner-staging://' : 'befitliner://';
  return <main className="trainer-store"><Link className="brand" href="/sk">FITLINER</Link><section style={{maxWidth:640,margin:'64px auto'}}>
    <p>TRÉNERSKÝ PROFIL</p><h1>Pokračuj vo Fitlineri</h1>
    <p>Vráť sa do aplikácie. Overíme tvoje prepojenie Stripe a dokončíme nastavenie trénerského profilu.</p>
    <p><a href={appUrl} style={{display:'inline-block',padding:'16px 24px',borderRadius:16,background:'#c6b4ff',color:'#211632',fontWeight:700,textDecoration:'none'}}>Otvoriť Fitliner</a></p>
    <p className="calendar-hint">Ak sa aplikácia neotvorí automaticky, otvor ju na telefóne a v menu vyber Môj trénerský profil. Ak Stripe vyžaduje doplnenie údajov, pokračuj v jeho prepojení.</p>
  </section></main>;
}
