# Fitliner Health — štartovacia stratégia Meta Ads

> Aktuálny experiment s maximálnym rozpočtom 200 € a zúžením na históriu krvných testov je v `fitliner-health-blood-history-test-2026-08.md`. Pri rozdiele má tento experimentálny dokument prednosť.

Aktualizované: 5. august 2026

## 1. Strategické rozhodnutie

- Prvý trh: **Slovensko**.
- Prvých 14 dní: jeden trh, jedna prospecting kampaň, široké publikum a viac kreatívnych hypotéz.
- Primárny cieľ: **kvalitná dokončená registrácia**, ale obchodným cieľom zostáva nákup a aktivovaný používateľ.
- Staré kampane nepoužívame ako šablónu ani zdroj publík, kým nepotvrdíme ich relevanciu pre Fitliner Health.
- Kampaň nespúšťame, kým nie je funkčná landing page, meranie a serverové odosielanie konverzií.

### Prečo Slovensko

Produkt má slovenskú lokalizáciu, cenu v eurách, lokálneho partnera Medirex a zakladateľ dokáže vytvoriť dôveryhodné video v rodnom jazyku. Získame tak prvé dáta bez miešania krajín, jazykov a rozdielnej úrovne produktovej pripravenosti. Českú republiku nezaraďujeme, kým nebude česká lokalizácia a lokálne overený funnel.

## 2. Ponuka, ktorú komunikujeme

Fitliner Health dáva na jedno miesto výsledky krvných testov a diagnostickej váhy, ukazuje ich vývoj a vytvára dlhodobý Health Score a odporúčania. Nie je to diagnostika ani náhrada lekára.

Hlavný sľub:

> Majte svoje zdravotné výsledky a ich vývoj prehľadne na jednom mieste.

Podporné benefity:

- nahratie PDF alebo fotografie výsledkov,
- kontrola a potvrdenie rozpoznaných hodnôt používateľom,
- trendy namiesto izolovaných meraní,
- pripomienky pravidelných meraní,
- ročný plán za 34,80 € (2,90 € mesačne pri ročnej platbe).

Cena sa bude testovať ako samostatná komunikačná hypotéza. Zľavu nepoužijeme v akvizícii, kým nepoznáme konverziu štandardnej ponuky.

## 3. Funnel a meranie

Odporúčaný rebrík udalostí:

1. `HealthLandingView`
2. `HealthQuizStart`
3. `HealthLeadCaptured`
4. `HealthRegistrationCompleted`
5. `InitiateCheckout`
6. `Purchase`
7. `HealthActivated` — prvé potvrdené nahratie alebo pridanie údajov

Do Meta sa nesmú posielať výsledky testov, zdravotné odpovede ani názvy zdravotných problémov. Posielajú sa iba všeobecné konverzné udalosti a povolené identifikátory podľa udeleného súhlasu.

Pixel a Conversions API musia používať rovnaký `event_id`, aby sa browserová a serverová udalosť deduplikovali. UTM názvy musia byť uložené pri registrácii a nákupe.

Implementačný stav:

- browserový a serverový `CompleteRegistration` používajú spoločné `event_id`,
- serverová udalosť sa odosiela iba po marketingovom súhlase,
- e-mail a interné ID sa pred odoslaním hashujú SHA-256,
- `Purchase` musí posielať Stripe webhook po potvrdenej platbe; návšteva success stránky sama osebe nákup nepotvrdzuje.

Prvá optimalizačná udalosť:

- ak ešte nemáme pravidelný objem nákupov, optimalizujeme na `HealthRegistrationCompleted`,
- paralelný test optimalizácie na `Purchase` spustíme po získaní dostatočného počtu nákupov,
- lacný lead bez dokončenej registrácie nie je úspech.

## 4. Štruktúra prvej kampane

Názov kampane:

`SK | Health | Website | Registration | Prospecting | 2026-08`

### URL a atribúcia

Cieľová URL pre slovenský štart:

`https://www.befitliner.com/sk/health`

Finálnu URL nevytvárame ručne pre každé video. V Meta použijeme dynamické parametre naviazané na stabilné názvy:

`utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}&campaign_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}`

Názvoslovie:

- kampaň: `SK | Health | Website | Registration | Prospecting | 2026-08`,
- ad set: `SK | Broad | 25-60 | All | Advantage+`,
- reklamy: `UGC | Scattered results | Hook 01 | V1`, `Demo | Upload to trends | Hook 01 | V1`, `Founder | One result is not a trend | Hook 01 | V1`.

Krajina je zámerne v URL ceste aj názve kampane. `utm_term` identifikuje publikum a `utm_content` kreatívu. ID parametre zostávajú stabilné aj v prípade, že niekto neskôr zmení názov objektu.

### Kampaň

- cieľ: Sales / Website,
- optimalizácia: dokončená registrácia (neskôr test Purchase),
- rozpočet: **30 € denne počas 14 dní**, teda maximálne 420 € na prvý validačný cyklus,
- Advantage+ placements,
- automatické rozdelenie rozpočtu medzi fungujúce kreatívy.

### Ad set

- krajina: Slovensko,
- vek: 25–60,
- pohlavie: všetci,
- jazyk neobmedzovať, aby sme zbytočne nevylúčili Slovákov s iným jazykom účtu,
- široké publikum bez záujmov,
- vylúčiť existujúcich platiacich používateľov Fitliner Health,
- existujúcich používateľov Fitliner automaticky nevylučovať — Health môže byť relevantný upsell.

Na malom rozpočte nerozdeľujeme publikum podľa záujmov, veku alebo pohlavia. Tieto segmenty najprv vyhodnotíme cez breakdowny. Retargeting vytvoríme až vtedy, keď bude mať dostatočné publikum; dovtedy ho Meta zvládne v rámci jedného systému efektívnejšie než samostatná hladujúca kampaň.

## 5. Kreatívny test — tri rozdielne hypotézy

Každé video: 9:16, 20–35 sekúnd, titulky, hovorená slovenčina, skutočná obrazovka produktu, bez stock videí a bez medicínskych sľubov. Prvé dve sekundy musia fungovať aj bez zvuku.

### Video A — Chaos verzus jedno miesto

Hypotéza: problémom je roztrúsenosť výsledkov.

**Záber 1 (0–3 s):** Zakladateľ drží vytlačené výsledky alebo ukazuje priečinok s PDF.

Text na obrazovke: `Kde máte výsledky spred roka?`

Hovorený text:

> Krvné testy v e-maile, výsledok z váhy v mobile a staršie merania niekde v zásuvke.

**Záber 2 (3–15 s):** Detail telefónu; nahratie dokumentu a prehľad hodnôt.

> Preto sme vytvorili Fitliner Health. Nahráte výsledky a máte ich prehľadne na jednom mieste.

**Záber 3 (15–26 s):** Ukážka trendu alebo Health Score.

> Namiesto jedného čísla vidíte, ako sa vaše merania vyvíjajú v čase.

**Záber 4 (26–32 s):** Zakladateľ do kamery.

> Vyskúšajte Fitliner Health a vytvorte si svoj dlhodobý zdravotný prehľad.

Text na obrazovke: `Zobraziť Fitliner Health`

### Video B — Produktová ukážka

Hypotéza: konkrétna ukážka odstráni neistotu, čo produkt robí.

**Záber 1 (0–3 s):** Screen recording dokumentu a tlačidla nahratia.

Text na obrazovke: `Z PDF na prehľad za pár krokov`

Hovorený text:

> Takto funguje Fitliner Health.

**Záber 2 (3–13 s):** Používateľ nahrá PDF alebo fotografiu a skontroluje hodnoty.

> Nahráte výsledky, skontrolujete rozpoznané hodnoty a uložíte ich do svojej Health Card.

**Záber 3 (13–23 s):** Trends/score/dashboard.

> Fitliner ich spojí do prehľadu, aby ste mohli sledovať vývoj v čase.

**Záber 4 (23–30 s):** Cena a CTA.

> Ročný plán stojí 34 eur 80. Pozrite si, či je Fitliner Health pre vás.

Text na obrazovke: `34,80 € / rok • Pozrieť viac`

### Video C — Jedno meranie nie je trend

Hypotéza: edukácia o dlhodobom vývoji vytvorí zvedavosť.

**Záber 1 (0–4 s):** Zakladateľ do kamery, vedľa neho jedno číslo na obrazovke.

Text na obrazovke: `Jedno meranie nie je trend.`

Hovorený text:

> Jedno meranie vám ukáže moment. Až viac meraní ukáže vývoj.

**Záber 2 (4–18 s):** Animácia alebo skutočný graf viacerých meraní.

> Fitliner Health spája výsledky krvných testov a diagnostickej váhy do dlhodobého prehľadu.

**Záber 3 (18–27 s):** Health Score a pripomienky.

> Vidíte trendy, Health Score a nezabudnete na ďalšie pravidelné meranie.

**Záber 4 (27–33 s):** CTA.

> Začnite si budovať svoju Health Card už dnes.

Text na obrazovke: `Vytvoriť Health Card`

## 6. Reklamné texty

### Variant 1 — organizácia

**Primary text:**

Výsledky krvných testov, diagnostickej váhy a staršie merania na jednom mieste. Fitliner Health vám pomôže vytvoriť prehľad a sledovať vývoj v čase. Vytvorte si svoju Health Card.

**Headline:** `Vaše výsledky. Jeden prehľad.`

**CTA:** Learn More

### Variant 2 — trend

**Primary text:**

Jedno meranie je iba moment. Fitliner Health spája vaše merania do dlhodobého prehľadu, v ktorom vidíte trendy a Health Score. Pozrite sa, ako funguje.

**Headline:** `Sledujte vývoj, nielen jedno číslo`

**CTA:** Learn More

### Variant 3 — cena a produkt

**Primary text:**

Nahrajte výsledky, skontrolujte hodnoty a sledujte ich vývoj v Health Card. Fitliner Health stojí 34,80 € ročne — 2,90 € mesačne pri ročnej platbe.

**Headline:** `Health Card za 34,80 € ročne`

**CTA:** Sign Up

## 7. Vyhodnotenie prvého testu

Poradie metrík:

1. cena za nákup,
2. cena za aktivovaného používateľa,
3. cena za dokončenú registráciu,
4. konverzia registrácia → nákup,
5. konverzia landing page → dokončená registrácia,
6. outbound CTR a cena za návštevu iba ako diagnostika kreatívy.

Rozhodovanie nerobíme podľa lajkov, CPM ani lacného kliku bez konverzie.

### Pravidlá počas prvých 14 dní

- Prvých 72 hodín nerobíme zásadné zmeny, pokiaľ reklama nemá technickú chybu alebo nulovú relevantnú odozvu.
- Kreatívu nevypíname po pár eurách; musí dostať rozumnú šancu vzhľadom na cieľovú cenu registrácie.
- Víťaza určujeme podľa kvalitných registrácií a nákupov, nie iba podľa CTR.
- Ak jedna hypotéza jasne vyhrá, nevyrábame iba jej kópie. Druhý cyklus obsahuje dve iterácie víťaza a jednu novú hypotézu.
- Rozpočet víťaznej kampane zvyšujeme približne o 20–30 % každých 48–72 hodín, iba ak sa drží cieľová cena a kvalita registrácií.
- Pri výraznom zvýšení rozpočtu vytvoríme samostatný kontrolovaný scale test.

Konečný maximálny CAC určíme z čistého výnosu po DPH, platobných poplatkoch, refundáciách a očakávanej obnove predplatného. Kým tieto údaje nemáme, 34,80 € nie je povolená cena za akvizíciu, ale hrubý ročný príjem.

## 8. Povinná kontrola pred spustením

- verejná a mobilne rýchla slovenská landing page,
- jasná ukážka produktu a ceny,
- ochrana osobných údajov, obchodné podmienky a zdravotný disclaimer,
- správne fungujúca registrácia a Stripe nákup,
- Pixel + Conversions API + deduplikácia,
- test udalostí od návštevy po nákup,
- UTM atribúcia uložená pri používateľovi a platbe,
- v Meta sa neposielajú zdravotné odpovede ani výsledky,
- vlastné publikum platiacich používateľov na vylúčenie,
- doména a reklamný účet bez otvorených obmedzení.

## 9. Roadmapa experimentov

### Cyklus 1 — Validácia problému a správy

Tri videá vyššie, široké slovenské publikum, 14 dní.

### Cyklus 2 — Iterácia víťaza

- dva nové hooky víťazného konceptu,
- krátka 15-sekundová verzia,
- samostatný test ceny v reklame verzus ceny až na landing page.

### Cyklus 3 — Funnel a optimalizačná udalosť

- dokončená registrácia verzus nákup,
- krátka landing page verzus existujúci viac-krokový funnel,
- retargeting návštevníkov, začatých registrácií a checkoutov.

### Cyklus 4 — Nový trh

Ďalšiu krajinu pridáme až po potvrdení ekonomiky na Slovensku a po lokalizácii produktu, podpory, právnych textov a relevantných partnerov. Každá krajina bude mať vlastný test, nie spoločný zmiešaný ad set.
