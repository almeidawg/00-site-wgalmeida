import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const scanRoots = ['src/components', 'src/pages', 'src/App.jsx', 'src/index.css', 'tailwind.config.js'];
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.css']);

const forbiddenPatterns = [
  { label: 'yellow utility/token', pattern: /\b(?:text|bg|border|ring|from|via|to|decoration|outline|shadow)-yellow-\d+\b/i },
  { label: 'amber utility/token', pattern: /\b(?:text|bg|border|ring|from|via|to|decoration|outline|shadow)-amber-\d+\b/i },
  { label: 'plain yellow word', pattern: /(?<![a-z])yellow(?![a-z])/i },
  { label: 'plain amber word', pattern: /(?<![a-z])amber(?![a-z])/i },
  { label: 'pure yellow hex', pattern: /#(?:ffff00|ff0)\b/i },
  { label: 'legacy gold hex', pattern: /#daa520\b/i },
  { label: 'pure yellow rgb', pattern: /rgb[a]?\(\s*255\s*,\s*255\s*,\s*0\b/i },
];

const ignoredRelativePatterns = [
  /^src\/data\/blogUnsplashManifest\.generated\.js$/,
  /^src\/services\/stabilityAI\.js$/,
];

const isIgnored = (relativePath) => ignoredRelativePatterns.some((pattern) => pattern.test(relativePath));

const walk = (target) => {
  const fullTarget = path.join(rootDir, target);
  if (!fs.existsSync(fullTarget)) return [];
  const stat = fs.statSync(fullTarget);
  if (stat.isFile()) return extensions.has(path.extname(fullTarget)) ? [fullTarget] : [];

  const entries = fs.readdirSync(fullTarget, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(fullTarget, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'dist-local', '.git'].includes(entry.name)) return [];
      return walk(path.relative(rootDir, fullPath));
    }
    return extensions.has(path.extname(entry.name)) ? [fullPath] : [];
  });
};

const files = [...new Set(scanRoots.flatMap(walk))].sort();
const findings = [];

for (const file of files) {
  const relative = path.relative(rootDir, file).replaceAll(path.sep, '/');
  if (isIgnored(relative)) continue;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const { label, pattern } of forbiddenPatterns) {
      if (pattern.test(line)) {
        findings.push({ relative, line: index + 1, label, source: line.trim() });
      }
    }
  });
}

if (findings.length > 0) {
  console.error('Forbidden non-WG visual color tokens found:');
  for (const finding of findings) {
    console.error(`- ${finding.relative}:${finding.line} [${finding.label}] ${finding.source}`);
  }
  process.exit(1);
}

console.log(`brand visual token audit OK: ${files.length} files checked`);
