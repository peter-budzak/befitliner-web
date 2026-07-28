import {readFile} from 'node:fs/promises';
import path from 'node:path';

const locales = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'];
const documents = {
  privacy: 17,
  terms: 25
};
const requiredNames = ['Fitliner Health', 'OpenAI', 'Stripe', 'Supabase'];
const errors = [];

for (const locale of locales) {
  for (const [document, expectedSections] of Object.entries(documents)) {
    const relativePath = path.join('content', 'legal', locale, `${document}.md`);
    let source;

    try {
      source = await readFile(relativePath, 'utf8');
    } catch (error) {
      errors.push(`${relativePath}: missing (${error.message})`);
      continue;
    }

    const frontMatter = source.match(/^---\n([\s\S]*?)\n---\n/);
    if (!frontMatter) {
      errors.push(`${relativePath}: missing YAML front matter`);
      continue;
    }

    for (const key of ['title', 'description']) {
      if (!new RegExp(`^${key}:\\s*\\S.+$`, 'm').test(frontMatter[1])) {
        errors.push(`${relativePath}: missing ${key}`);
      }
    }

    if (!/^lastUpdated:\s*\d{4}-\d{2}-\d{2}$/m.test(frontMatter[1])) {
      errors.push(`${relativePath}: lastUpdated must use YYYY-MM-DD`);
    }

    const body = source.slice(frontMatter[0].length);
    if (/^#\s+/m.test(body)) {
      errors.push(`${relativePath}: body must not contain a second page H1`);
    }

    const headings = [...body.matchAll(/^##\s+(\d+)\./gm)].map((match) => Number(match[1]));
    const expected = Array.from({length: expectedSections}, (_, index) => index + 1);
    if (JSON.stringify(headings) !== JSON.stringify(expected)) {
      errors.push(
        `${relativePath}: expected numbered sections 1-${expectedSections}; found ${headings.join(', ')}`
      );
    }

    for (const name of requiredNames) {
      if (!body.includes(name)) errors.push(`${relativePath}: missing service disclosure for ${name}`);
    }

    const foreignLocaleLinks = locales
      .filter((item) => item !== locale)
      .filter((item) => new RegExp(`\\/${item}\\/(privacy|terms|delete-account)(?:[)#?]|$)`).test(body));
    if (foreignLocaleLinks.length > 0) {
      errors.push(`${relativePath}: links to another locale (${foreignLocaleLinks.join(', ')})`);
    }

    if (body.includes('Fitliner does not process payments') || body.includes('Fitliner is entirely free')) {
      errors.push(`${relativePath}: contains obsolete payment or pricing statement`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Legal content validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${locales.length * Object.keys(documents).length} localized legal documents.`);
}
