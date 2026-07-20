import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const distDir = path.resolve(root, process.argv[2] || process.env.BUILD_OUT_DIR || 'dist');
const assetsDir = path.join(distDir, 'assets');
const MAX_VENDOR_REACT_BYTES = 230 * 1024;
const DEV_ONLY_MARKERS = [
  'react-stack-bottom-frame',
  'validateDOMNesting',
  'Each child in a list should have a unique',
];

if (!fs.existsSync(assetsDir)) {
  throw new Error(`React bundle audit failed: missing assets directory ${assetsDir}`);
}

const candidates = fs.readdirSync(assetsDir)
  .filter((name) => /^vendor-react-[^/]+\.js$/.test(name))
  .sort();

if (candidates.length !== 1) {
  throw new Error(`React bundle audit failed: expected 1 vendor-react chunk, found ${candidates.length}`);
}

const filename = candidates[0];
const filePath = path.join(assetsDir, filename);
const stat = fs.statSync(filePath);
const source = fs.readFileSync(filePath, 'utf8');
const matchedMarkers = DEV_ONLY_MARKERS.filter((marker) => source.includes(marker));

if (stat.size > MAX_VENDOR_REACT_BYTES) {
  throw new Error(
    `React bundle audit failed: ${filename} is ${stat.size} bytes; maximum is ${MAX_VENDOR_REACT_BYTES}`,
  );
}

if (matchedMarkers.length > 0) {
  throw new Error(`React bundle audit failed: development markers found: ${matchedMarkers.join(', ')}`);
}

console.log(`React production bundle audit OK: ${filename} (${stat.size} bytes)`);
