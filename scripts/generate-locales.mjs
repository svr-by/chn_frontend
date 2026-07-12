/**
 * Generates ru/zh locale JSON from en by applying per-namespace translation tables.
 * Run: node scripts/generate-locales.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const enDir = path.join(root, 'src/locales/en');

function deepTranslate(obj, table) {
  if (typeof obj === 'string') {
    return table[obj] ?? obj;
  }
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = deepTranslate(v, table);
    }
    return out;
  }
  return obj;
}

function loadTable(locale) {
  const tablePath = path.join(__dirname, `translations-${locale}.json`);
  if (!fs.existsSync(tablePath)) {
    console.warn(`Missing ${tablePath}, copying en strings`);
    return {};
  }
  return JSON.parse(fs.readFileSync(tablePath, 'utf8'));
}

for (const locale of ['ru', 'zh']) {
  const table = loadTable(locale);
  const outDir = path.join(root, 'src/locales', locale);
  fs.mkdirSync(outDir, { recursive: true });

  for (const file of fs.readdirSync(enDir)) {
    if (!file.endsWith('.json')) continue;
    const en = JSON.parse(fs.readFileSync(path.join(enDir, file), 'utf8'));
    const translated = deepTranslate(en, table);
    fs.writeFileSync(
      path.join(outDir, file),
      `${JSON.stringify(translated, null, 2)}\n`,
    );
  }
  console.log(`Generated ${locale} locales`);
}
