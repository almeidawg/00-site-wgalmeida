import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const localeDir = path.join(srcDir, 'i18n', 'locales');
const locales = ['pt-BR', 'en', 'es'];
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx']);
const publicAuditFiles = new Set([
  'src/components/layout/Header.jsx',
  'src/components/layout/Footer.jsx',
  'src/pages/Home.jsx',
  'src/pages/Blog.jsx',
  'src/pages/About.jsx',
  'src/pages/AMarca.jsx',
  'src/pages/ObraEasyLanding.jsx',
  'src/pages/RoomVisualizer.jsx',
  'src/pages/RevistaEstilos.jsx',
]);

const localeData = Object.fromEntries(
  locales.map((locale) => [
    locale,
    JSON.parse(fs.readFileSync(path.join(localeDir, `${locale}.json`), 'utf8')),
  ]),
);

const hasKey = (source, key) => {
  let current = source;
  for (const part of key.split('.')) {
    if (!current || typeof current !== 'object' || !(part in current)) return false;
    current = current[part];
  }
  return true;
};

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'dist-local', '.git'].includes(entry.name)) return [];
      return walk(fullPath);
    }
    return extensions.has(path.extname(entry.name)) ? [fullPath] : [];
  });
};

const literalPatterns = [
  /\bt\s*\(\s*['"`]([A-Za-z][A-Za-z0-9_-]*(?:\.[A-Za-z0-9_-]+)+)['"`]/g,
  /\bi18nKey\s*=\s*['"`]([A-Za-z][A-Za-z0-9_-]*(?:\.[A-Za-z0-9_-]+)+)['"`]/g,
];

const usedKeys = new Map();

for (const file of walk(srcDir)) {
  const relative = path.relative(rootDir, file).replaceAll(path.sep, '/');
  if (!publicAuditFiles.has(relative)) continue;
  const source = fs.readFileSync(file, 'utf8');
  for (const pattern of literalPatterns) {
    for (const match of source.matchAll(pattern)) {
      const key = match[1];
      if (!usedKeys.has(key)) usedKeys.set(key, new Set());
      usedKeys.get(key).add(relative);
    }
  }
}

const missing = [];

for (const [key, files] of [...usedKeys.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  for (const locale of locales) {
    if (!hasKey(localeData[locale], key)) {
      missing.push({
        key,
        locale,
        files: [...files].sort(),
      });
    }
  }
}

if (missing.length) {
  console.error('Missing i18n literal keys:');
  for (const item of missing) {
    console.error(`- ${item.locale}: ${item.key}`);
    for (const file of item.files.slice(0, 5)) console.error(`  ${file}`);
  }
  process.exit(1);
}

console.log(`public i18n literal key audit OK: ${usedKeys.size} keys checked across ${locales.join(', ')}`);
