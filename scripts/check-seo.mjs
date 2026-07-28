const baseUrl = process.env.SEO_BASE_URL || 'http://localhost:3000';
const canonicalOrigin = 'https://www.befitliner.com';
const locales = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'];
const guideSlugs = ['phone-gym-access', 'gym-management-software-checklist', 'health-report-timeline'];
const errors = [];

function count(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

async function fetchText(path) {
  const response = await fetch(`${baseUrl}${path}`, {redirect: 'follow'});
  const body = await response.text();
  if (!response.ok) errors.push(`${path}: HTTP ${response.status}`);
  return {response, body};
}

const robots = await fetchText('/robots.txt');
if (!robots.body.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`)) {
  errors.push('/robots.txt: missing canonical sitemap URL');
}

const sitemap = await fetchText('/sitemap.xml');
if (!sitemap.body.includes(`<loc>${canonicalOrigin}/en</loc>`)) errors.push('/sitemap.xml: missing English home');
if (sitemap.body.includes('http://localhost')) errors.push('/sitemap.xml: contains localhost URL');

const indexable = locales.flatMap((locale) => [
  {path: `/${locale}`, alternates: 7},
  {path: `/${locale}/health`, alternates: 7},
  {path: `/${locale}/gyms`, alternates: 7}
]);

for (const locale of ['en', 'sk']) {
  indexable.push({path: `/${locale}/guides`, alternates: 3});
  for (const slug of guideSlugs) indexable.push({path: `/${locale}/guides/${slug}`, alternates: 3});
}

for (const page of indexable) {
  const {body} = await fetchText(page.path);
  const canonical = `${canonicalOrigin}${page.path}`;
  if (!body.includes(`<link rel="canonical" href="${canonical}"`)) errors.push(`${page.path}: wrong or missing canonical`);
  if (count(body, /<link rel="alternate" hrefLang=/g) !== page.alternates && count(body, /<link rel="alternate" hreflang=/g) !== page.alternates) {
    errors.push(`${page.path}: expected ${page.alternates} hreflang links`);
  }
  if (count(body, /<h1(?:\s|>)/g) !== 1) errors.push(`${page.path}: expected exactly one h1`);
  if (!/<title>[^<]{10,}<\/title>/.test(body)) errors.push(`${page.path}: missing useful title`);
  const description = body.match(/<meta name="description" content="([^\"]+)"/)?.[1] ?? '';
  const minimumDescriptionLength = page.path.startsWith('/zh-Hans') ? 20 : 50;
  if (description.length < minimumDescriptionLength) errors.push(`${page.path}: missing useful description`);
  if (count(body, /type="application\/ld\+json"/g) < 2) errors.push(`${page.path}: missing page-level structured data`);
  if (/content="noindex/.test(body)) errors.push(`${page.path}: unexpectedly noindex`);
}

for (const path of ['/en/health/success', '/en/delete-account', '/en/competition']) {
  const {body} = await fetchText(path);
  if (!/content="noindex/.test(body)) errors.push(`${path}: expected noindex`);
}

if (errors.length > 0) {
  console.error(`SEO validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${indexable.length} canonical SEO pages, robots, sitemap and utility noindex rules.`);
}
