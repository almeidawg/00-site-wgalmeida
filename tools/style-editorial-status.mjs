import fs from 'node:fs';
import path from 'node:path';
import STYLE_IMAGE_MANIFEST, {
  getStyleImageUrl,
  getStyleRemoteFallbackUrl,
} from '../src/data/styleImageManifest.js';

const root = process.cwd();
const estilosDir = path.join(root, 'src', 'content', 'estilos');
const publicImagesDir = path.join(root, 'public', 'images', 'estilos');
const reportPath = path.join(root, `style-editorial-status-${new Date().toISOString().slice(0, 10)}.json`);
const latestReportPath = path.join(root, 'style-editorial-status.latest.json');

const slugToTitle = (slug = '') =>
  slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const buildSearchUrls = (slug) => {
  const theme = `${slugToTitle(slug)} interior design`;
  return {
    googleImages: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(theme)}`,
    unsplash: `https://unsplash.com/s/photos/${encodeURIComponent(theme)}`,
  };
};

const checkResolvedAssetStatus = async (url) => {
  if (!url) return { ok: false, status: 0, error: 'missing-url', source: 'missing' };

  if (url.startsWith('/')) {
    const localPath = path.join(root, 'public', url.replace(/^\/+/, ''));
    return {
      ok: fs.existsSync(localPath),
      status: fs.existsSync(localPath) ? 200 : 404,
      error: fs.existsSync(localPath) ? '' : 'missing-local-file',
      source: 'local',
    };
  }

  try {
    let response = await fetch(url, { method: 'HEAD' });

    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, { method: 'GET' });
    }

    return {
      ok: response.ok,
      status: response.status,
      error: '',
      source: 'remote',
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
      source: 'remote',
    };
  }
};

const styleSlugs = fs
  .readdirSync(estilosDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
  .map((entry) => entry.name.replace(/\.md$/, ''))
  .sort();

const report = await Promise.all(
  styleSlugs.map(async (slug) => {
    const localWebp = path.join(publicImagesDir, `${slug}.webp`);
    const localSvg = path.join(publicImagesDir, `${slug}.svg`);
    const hasLocalWebp = fs.existsSync(localWebp);
    const hasLocalSvg = fs.existsSync(localSvg);
    const manifestEntry = STYLE_IMAGE_MANIFEST?.[slug] || null;
    const resolvedPublicUrl = getStyleImageUrl({ slug, variant: 'card' }) || '';
    const remoteFallbackUrl = getStyleRemoteFallbackUrl({ slug, variant: 'card' }) || '';
    const remoteFallbackStatus = await checkResolvedAssetStatus(remoteFallbackUrl);

    return {
      slug,
      title: slugToTitle(slug),
      hasLocalWebp,
      hasLocalSvg,
      publicReady: hasLocalWebp,
      hasManifestEntry: Boolean(manifestEntry),
      resolvedPublicUrl,
      resolvedPublicReachable: hasLocalWebp,
      remoteFallbackUrl,
      hasRemoteFallback: Boolean(remoteFallbackUrl),
      remoteFallbackReachable: Boolean(remoteFallbackUrl && remoteFallbackStatus.ok),
      remoteFallbackStatus: remoteFallbackUrl ? remoteFallbackStatus.status : 0,
      remoteFallbackError: remoteFallbackUrl ? remoteFallbackStatus.error : '',
      search: buildSearchUrls(slug),
    };
  })
);

const summary = {
  styles: report.length,
  localWebp: report.filter((item) => item.hasLocalWebp).length,
  localSvg: report.filter((item) => item.hasLocalSvg).length,
  publicReady: report.filter((item) => item.publicReady).length,
  manifestEntries: report.filter((item) => item.hasManifestEntry).length,
  resolvedPublicReachable: report.filter((item) => item.resolvedPublicReachable).length,
  resolvedPublicBroken: report.filter((item) => !item.resolvedPublicReachable).length,
  remoteFallbackConfigured: report.filter((item) => item.hasRemoteFallback).length,
  remoteFallbackReachable: report.filter((item) => item.remoteFallbackReachable).length,
  remoteFallbackBroken: report.filter((item) => item.hasRemoteFallback && !item.remoteFallbackReachable).length,
  remoteFallbackRetired: report.filter((item) => !item.hasRemoteFallback).length,
  missingManifest: report.filter((item) => !item.hasManifestEntry).length,
};

const payload = { generatedAt: new Date().toISOString(), summary, report };

fs.writeFileSync(reportPath, JSON.stringify(payload, null, 2));
fs.writeFileSync(latestReportPath, JSON.stringify(payload, null, 2));

console.log(`Styles: ${summary.styles}`);
console.log(`Local WEBP: ${summary.localWebp}`);
console.log(`Local SVG: ${summary.localSvg}`);
console.log(`Public ready: ${summary.publicReady}`);
console.log(`Manifest entries: ${summary.manifestEntries}`);
console.log(`Resolved public reachable: ${summary.resolvedPublicReachable}`);
console.log(`Resolved public broken: ${summary.resolvedPublicBroken}`);
console.log(`Remote fallback configured: ${summary.remoteFallbackConfigured}`);
console.log(`Remote fallback reachable: ${summary.remoteFallbackReachable}`);
console.log(`Remote fallback broken: ${summary.remoteFallbackBroken}`);
console.log(`Remote fallback retired: ${summary.remoteFallbackRetired}`);
console.log(`Missing manifest: ${summary.missingManifest}`);

if (summary.missingManifest > 0) {
  console.log('\nMissing style manifest entries:');
  for (const item of report.filter((entry) => !entry.hasManifestEntry)) {
    console.log(`- ${item.slug}`);
    console.log(`  Google Images: ${item.search.googleImages}`);
    console.log(`  Unsplash: ${item.search.unsplash}`);
  }
}

if (summary.remoteFallbackBroken > 0) {
  console.log('\nBroken remote style fallbacks:');
  for (const item of report.filter((entry) => entry.hasRemoteFallback && !entry.remoteFallbackReachable)) {
    console.log(`- ${item.slug} (${item.remoteFallbackStatus || item.remoteFallbackError || 'unknown'})`);
    console.log(`  ${item.remoteFallbackUrl}`);
  }
}

console.log(`Saved report to ${reportPath}`);
console.log(`Saved latest report to ${latestReportPath}`);
