# Fitliner Health — test histórie krvných výsledkov

Aktuálne rozhodnutie: 22. august 2026  
Tento dokument má prednosť pred pôvodným štartovacím rozpočtom v `fitliner-health-meta-ads-strategy.md`.

## Čo testujeme

Predávame jeden konkrétny use case: **staré aj nové krvné výsledky v jednej digitálnej histórii**. V reklamách ani v slovenskom paid funneli nemiešame diagnostickú váhu. Produkt ju môže naďalej obsahovať, ale nie je súčasťou tejto akvizičnej správy.

Primárna optimalizačná udalosť v prvom teste je `CompleteRegistration`. Obchodný výsledok je platené ročné predplatné. Registrácia bez nákupného zámeru nie je víťazstvo.

## Ekonomika

- Koncová cena: **34,80 € za 12 mesiacov**.
- Slovenská základná DPH: 23 %; podiel DPH v cene je približne 6,51 €.
- Orientačné Stripe náklady pri bežnej EEA karte a Managed Payments:
  - spracovanie platby približne 1,5 % + 0,25 €,
  - Managed Payments približne 3,5 % z celej transakcie,
  - pri predplatnom môže byť navyše účtovaný poplatok Stripe Billing podľa reálneho nastavenia účtu.
- Orientačný príspevok pred reklamou a používaním produktu je približne **26 €**.
- AI spracovanie jedného nahraného testu stojí približne 1 €; príspevok po jednom teste je preto približne **25 €**. Pri viacerých importoch treba odpočítať 1 € za každý spracovaný test.

Kým nemáme skutočný payout, refundácie a priemerný počet importov na zákazníka, používame konzervatívne hranice:

- cieľový CAC za prvý nákup: **do 15 €**,
- pásmo na opatrnú ďalšiu validáciu: **15–20 €**,
- nad **20 €** neškálujeme,
- absolútny break-even CAC nie je 34,80 €, ale približne 25 € pri jednom spracovanom teste.

Pri rozpočte 200 € potrebujeme približne 8 platiacich zákazníkov iba na orientačný break-even a aspoň 10 zákazníkov na rozumný prvý zisk. Jeden alebo dva nákupy ešte nepotvrdzujú udržateľnú ekonomiku.

## Štruktúra kampane

### Kampaň

- názov: `SK | Health | Sales | Registration | Blood History | 2026-08`
- cieľ: `Sales`
- conversion location: `Website`
- special ad category: žiadna
- bid strategy: `Highest volume`
- kampaň musí zostať vypnutá, kým nie sú nahraté a skontrolované reklamy

### Ad set

- názov: `SK | Broad | 35-65+ | All | Blood History`
- dataset/pixel: `Befitliner.com` (`475851925437843`)
- conversion event: `CompleteRegistration`
- attribution: 7-day click / 1-day view, ak je táto možnosť dostupná
- krajina: Slovensko
- preferovaný vek: 35–65+; pri Advantage+ publiku Meta v aktuálnom rozhraní dovolila ako pevné spodné obmedzenie najviac 25 rokov
- pohlavie: všetci
- jazyk: neobmedzovať
- záujmy: žiadne
- placements: Advantage+
- vylúčenie: existujúci platiaci Fitliner Health používatelia, iba ak máme korektné vlastné publikum
- rozpočet: **lifetime 200 € na 10 dní**; nejde o denný rozpočet a tým je chránený absolútny strop testu
- harmonogram: **24. august 2026 09:30 – 3. september 2026 09:30 (Europe/Bratislava)**, presne 10 dní

Jeden ad set je zámer. Pri rozpočte 200 € nevytvárame samostatné publiká, retargeting ani lookalike ad sety.

## Kreatívy

V prvom kole sú aktívne iba tri reklamy. Všetky majú rovnaké telo videa, text, headline, CTA, landing page a nastavenia. Mení sa iba prvý 4-sekundový hook.

1. `UGC | Blood History | H02 Cholesterol 10y | Long | V1`
2. `UGC | Blood History | H05 Forgotten drawer | Long | V1`
3. `UGC | Blood History | H07 Number vs history | Long | V1`

Prečo tieto tri:

- H02 testuje konkrétnu zvedavosť a okamžitú produktovú premenu,
- H05 testuje rozpoznateľný problém so stratou dokumentov,
- H07 testuje racionálny benefit dlhodobého trendu.

Ostatné hooky zostávajú v zásobníku. H09 je blízky duplikát H02. H01 a H10 môžu produkt nesprávne pozicionovať ako nástroj pre lekára. H06 a H08 sú širšie emocionálne koncepty vhodné do druhého kola. H03 a H04 sú výrazné vizuálne alternatívy problému s papiermi.

## Jednotný reklamný text

**Primary text**

> Staré aj nové krvné výsledky na jednom mieste. Nahrajte PDF alebo fotografiu, skontrolujte rozpoznané hodnoty a sledujte ich vývoj po rokoch. Fitliner Health stojí 34,80 € ročne. Nejde o diagnózu ani náhradu lekárskej rady.

**Headline**

> História krvných výsledkov za 34,80 € ročne

**Description**

> PDF alebo fotografia · kontrola pred uložením

**CTA:** `Learn More`

**URL**

`https://www.befitliner.com/sk/health`

**URL parameters**

`utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}&campaign_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}`

Cena je v texte zámerne. Pri malom rozpočte chceme menej lacných zvedavých registrácií a viac ľudí, ktorí vopred poznajú cenu.

## Rozdelenie 200 €

Rozpočet je jeden lifetime limit. Nasledujúce sumy sú kontrolné brány, nie tri nové kampane.

### Kolo 1 — 0 až 90 €

- H02, H05 a H07 aktívne.
- Prvých 48 hodín nemeníme nič okrem technickej chyby alebo zamietnutej reklamy.
- Kreatívu neposudzujeme pred približne 1 000 impresiami alebo 15 € spendu.

### Kolo 2 — 90 až 150 €

- ponechať víťaza,
- pridať H06 ako emocionálny kontrast,
- pridať H09 iba vtedy, ak H02 vyhráva; inak pridať H03 ako nový vizuálny problém,
- telo videa, text a landing page nemeníme.

### Kolo 3 — 150 až 200 €

- ponechať maximálne dve najlepšie reklamy,
- validovať, či registrácie vedú k checkoutom a nákupom,
- po 200 € kampaň automaticky skončí; pokračovanie je nové rozhodnutie podľa ekonomiky.

## Metriky a rozhodovanie

Obchodné poradie:

1. nákupy a CAC,
2. `InitiateCheckout` a cena za checkout,
3. `CompleteRegistration` a cena za registráciu,
4. registrácia → checkout → nákup,
5. landing page → registrácia,
6. outbound CTR a landing-page views,
7. hook rate: 3-second video plays / impressions,
8. hold rate: 15-second video plays / 3-second video plays,
9. priemerný čas prehrávania.

Pracovné stop pravidlá:

- technická chyba, nesprávna URL alebo zamietnutie: opraviť okamžite,
- celkový spend 60 € a nula registrácií: zastaviť a opraviť funnel alebo ponuku,
- celkový spend 100 € a nula checkoutov: zastaviť; lacné registrácie nie sú dostatočný signál,
- celkový spend 150 € a nula nákupov: zastaviť pred minutím zvyšku,
- konkrétna reklama s aspoň 25 € spendom a nulou registrácií sa vypína,
- nákup má prednosť pred CTR; reklama s nižším CTR môže vyhrať, ak prináša lacnejších zákazníkov.

Víťaza hooku označíme až keď má minimálne tri registrácie a súčasne nevykazuje horšiu kvalitu v ďalších krokoch. Pri veľmi malých počtoch výsledok označíme iba ako smerový, nie štatisticky potvrdený.

## Meranie pred štartom

- `HealthLandingView` je aktívny.
- `CompleteRegistration` prichádza cez Pixel a Conversions API; aktuálna Event Match Quality bola pri audite 6,2/10.
- `Purchase` zatiaľ v datasete chýba. Počas prvého malého testu preto každý nákup overujeme v Stripe a spájame s uloženou UTM atribúciou.
- Pred škálovaním je povinné doplniť serverový `Purchase` zo Stripe webhooku; success stránka sa nesmie považovať za potvrdený nákup.
- Meta nesmie dostať krvné výsledky, zdravotné odpovede, názvy metrík ani obsah dokumentov.

## Kontrolný záznam po každej bráne

| Spend | Ad | Impressions | 3s plays | 15s plays | LPV | Registrations | Checkouts | Purchases | Revenue | Rozhodnutie |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 90 € | H02 |  |  |  |  |  |  |  |  |  |
| 90 € | H05 |  |  |  |  |  |  |  |  |  |
| 90 € | H07 |  |  |  |  |  |  |  |  |  |
