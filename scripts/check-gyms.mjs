import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const locales = ['sk', 'en', 'de', 'es', 'fr', 'zh-Hans'];
const copies = locales.map((locale) =>
  JSON.parse(readFileSync(`messages/gyms/${locale}.json`, 'utf8')),
);
for (const copy of copies) {
  assert.deepEqual(Object.keys(copy).sort(), Object.keys(copies[0]).sort());
  assert.equal(copy.faq.length, 8);
  assert.equal(copy.workflow.length, 6);
  assert.equal(copy.steps.length, 4);
  assert.equal(copy.packageItems.length, 4);
  assert.ok(copy.cta.includes('15'));
  assert.ok(!JSON.stringify(copy).includes('undefined'));
}

// Exercise actual client event handlers with an isolated Meta sink; never send test events to Meta.
let consent = 'rejected';
const events = [];
const browserWindow = {fbq: (...args) => events.push(args)};
const storage = {getItem: () => consent};
const source = ts.transpileModule(
  readFileSync('components/gyms/gyms-interactions.tsx', 'utf8'),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020,
    },
  },
).outputText;
const exports = {};
vm.runInNewContext(source, {
  exports,
  window: browserWindow,
  localStorage: storage,
  require: (name) => {
    if (name === 'react')
      return {
        useRef: (value) => ({current: value}),
        useState: (value) => [value, () => {}],
        useEffect: () => {},
      };
    if (name === 'next/dynamic') return {default: () => () => null};
    if (name === '@/lib/meta-pixel')
      return {
        MARKETING_CONSENT_KEY: 'fitliner_marketing_tracking_consent',
        ensureMetaPixel: () => {},
      };
    return require(name);
  },
});
exports.trackGymEvent('gyms_landing_view');
assert.equal(events.length, 0, 'No event before consent');
const link = exports.GymLink({
  href: '/checkout',
  location: 'offer',
  order: true,
  children: 'Order',
});
consent = 'accepted';
link.props.onClick();
assert.deepEqual(
  events.map((e) => e[1]),
  ['gyms_primary_cta_click', 'gyms_starter_order_start'],
);
events.length = 0;
const video = exports.GymVideo({
  src: '/video.mp4',
  poster: '/poster.jpg',
  label: 'Play',
});
video.props.onPlay();
video.props.onPlay();
for (const currentTime of [25, 25, 50, 51, 75, 99])
  video.props.onTimeUpdate({
    currentTarget: {duration: 100, currentTime, seeking: false},
  });
video.props.onEnded();
video.props.onEnded();
assert.deepEqual(
  events.map((e) => e[1]),
  [
    'gyms_vsl_play',
    'gyms_vsl_25',
    'gyms_vsl_50',
    'gyms_vsl_75',
    'gyms_vsl_complete',
  ],
);
const before = events.length;
consent = 'rejected';
link.props.onClick();
assert.equal(events.length, before, 'Revoking consent stops subsequent events');
consent = 'accepted';
const faq = exports.GymFaq({items: [['Question', 'Answer']]});
faq.props.children[0].props.onToggle({currentTarget: {open: false}});
assert.equal(
  events.length,
  before,
  'Closing FAQ does not track a second interaction',
);
faq.props.children[0].props.onToggle({currentTarget: {open: true}});
assert.equal(events.at(-1)[1], 'gyms_faq_interaction');

// Verify shared initialization cannot inject two pixels.
const pixelSource = ts.transpileModule(
  readFileSync('lib/meta-pixel.ts', 'utf8'),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  },
).outputText;
const pixelExports = {};
const pixelWindow = {};
const scripts = [];
vm.runInNewContext(pixelSource, {
  exports: pixelExports,
  process: {env: {}},
  window: pixelWindow,
  document: {
    createElement: () => ({}),
    head: {appendChild: (script) => scripts.push(script)},
  },
});
assert.equal(pixelExports.ensureMetaPixel(), true);
assert.equal(pixelExports.ensureMetaPixel(), false);
assert.equal(scripts.length, 1);
assert.equal(pixelWindow.fbq.queue.filter((e) => e[0] === 'init').length, 1);
console.log(
  'PASS: six locale dictionaries; consent gating and revocation; one CTA/order event per click; deduplicated VSL milestones; FAQ opens; single shared pixel initialization.',
);

// Walk the optional flow against a fake Supabase transport. No production lead is created.
const funnelSource = ts.transpileModule(
  readFileSync('components/gyms/gyms-funnel.tsx', 'utf8'),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020,
    },
  },
).outputText;
const funnelExports = {};
const state = [];
let cursor = 0;
let firstRender = true;
const effects = [];
const requests = [];
vm.runInNewContext(funnelSource, {
  exports: funnelExports,
  process: {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.invalid',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-only',
    },
  },
  window: {
    localStorage: {getItem: () => 'test-submission', setItem: () => {}},
    location: {pathname: '/sk/gyms', href: 'https://test.invalid/sk/gyms'},
  },
  crypto: {randomUUID: () => 'test-submission'},
  fetch: async (url, options) => {
    requests.push({url, body: JSON.parse(options.body)});
    return {ok: true};
  },
  console,
  require: (name) => {
    if (name === 'react')
      return {
        useState: (initial) => {
          const index = cursor++;
          if (!(index in state)) state[index] = initial;
          return [
            state[index],
            (value) => {
              state[index] = value;
            },
          ];
        },
        useCallback: (callback) => callback,
        useEffect: (effect) => {
          if (firstRender) effects.push(effect);
        },
      };
    if (name === '@/lib/gyms')
      return {GYMS_CHECKOUT_URL: 'https://checkout.test.invalid'};
    return require(name);
  },
});
function renderFunnel() {
  cursor = 0;
  return funnelExports.default({
    locale: 'sk',
    assessmentOnly: true,
    resultCopy: 'Assessment saved',
  });
}
function findNode(node, predicate) {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
  return null;
}
renderFunnel();
effects.forEach((effect) => effect());
firstRender = false;
function button(text) {
  const found = findNode(
    renderFunnel(),
    (node) => node.type === 'button' && node.props.children === text,
  );
  assert.ok(found, `Missing button: ${text}`);
  return found;
}
function input(label, value) {
  const found = findNode(
    renderFunnel(),
    (node) => node.type === 'input' && node.props['aria-label'] === label,
  );
  assert.ok(found, `Missing input: ${label}`);
  found.props.onChange({target: {value}});
}
await button('Áno').props.onClick();
input('Názov fitnesscentra', 'Test Gym');
input(
  'Začnite písať adresu fitnesscentra',
  'Test address without a Google selection',
);
assert.equal(button('Pokračovať').props.disabled, false);
await button('Pokračovať').props.onClick();
button('Áno').props.onClick();
button('Turniket').props.onClick();
// There are now reception and existing-system yes buttons. Select the latter.
const yesButtons = [];
function collect(node) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'button' && node.props.children === 'Áno')
    yesButtons.push(node);
  [node.props?.children].flat(Infinity).forEach(collect);
}
collect(renderFunnel());
yesButtons.at(-1).props.onClick();
await button('Pokračovať').props.onClick();
input('Meno a priezvisko', 'Test Owner');
input('Email', 'owner@example.invalid');
await button('Pokračovať').props.onClick();
assert.equal(
  findNode(renderFunnel(), (node) => node.props?.role === 'status').props
    .children,
  'Assessment saved',
);
assert.deepEqual(
  requests.map((request) => request.body.completed_step),
  [2, 3, 4, 5],
);
assert.equal(requests.at(-1).body.access_type, 'Turniket');
assert.equal(requests.at(-1).body.has_reception, 'Áno');
assert.equal(requests.at(-1).body.has_system, 'Áno');
assert.equal(requests.at(-1).body.google_place_id, null);
assert.equal(requests.at(-1).body.reached_final_step, true);
assert.equal(requests.at(-1).body.checkout_clicked, false);
assert.equal(requests.at(-1).body.email, 'owner@example.invalid');
console.log(
  'PASS: four-step optional assessment, manual address fallback, saved contact and unchanged Supabase field/enum contract.',
);
