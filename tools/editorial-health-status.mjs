import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const today = new Date().toISOString().slice(0, 10);
const reportPath = path.join(root, `editorial-health-status-${today}.json`);
const latestReportPath = path.join(root, 'editorial-health-status.latest.json');

const runTool = (script) => {
  execFileSync(process.execPath, [path.join(root, 'tools', script)], {
    cwd: root,
    stdio: 'inherit',
  });
};

const readJson = (filename) => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));

runTool('blog-editorial-status.mjs');
runTool('build-editorial-search-report.mjs');
runTool('audit-blog-image-repetition.mjs');
runTool('style-editorial-status.mjs');

const blogStatus = readJson('blog-editorial-status.latest.json');
const editorialSearch = readJson('editorial-search-report.latest.json');
const blogRepetition = readJson('blog-image-repetition-audit.latest.json');
const styleStatus = readJson('style-editorial-status.latest.json');

const blogSummary = blogStatus.summary || {};
const blogCoverage = blogSummary.coverage || {};
const searchSummary = editorialSearch.summary || {};
const repetitionSummary = blogRepetition.summary || {};
const styleSummary = styleStatus.summary || {};

const coveredBlogPosts = [
  'published-manifest',
  'published-two-slot',
  'published-remote-curated',
  'published-local',
  'published-other',
].reduce((total, key) => total + (blogCoverage[key] || 0), 0);

const blogStructuralClosed = Boolean(
  blogSummary.totalPosts > 0
  && coveredBlogPosts === blogSummary.totalPosts
  && (blogCoverage['generic-banner-fallback'] || 0) === 0
  && (blogCoverage['missing-image'] || 0) === 0
  && (blogSummary.pendingSlugs || []).length === 0
  && (repetitionSummary.missingHero || 0) === 0
  && (repetitionSummary.missingCard || 0) === 0
  && (repetitionSummary.missingThumb || 0) === 0
  && (repetitionSummary.problematicDuplicates || 0) === 0
  && (repetitionSummary.allThreeEqual || 0) === 0
);

const blogCloudMigrationClosed = Boolean(
  (searchSummary.blogNeedsSearch || 0) === 0
  && (searchSummary.blogHeroUnsplashOrRemote || 0) === 0
  && (searchSummary.blogCardUnsplashOrRemote || 0) === 0
);

const stylesStructuralClosed = Boolean(
  styleSummary.styles > 0
  && styleSummary.styles === styleSummary.localWebp
  && styleSummary.styles === (styleSummary.publicReady || 0)
);

const stylesRemoteFallbackClosed = Boolean(
  styleSummary.styles > 0
  && styleSummary.styles === (styleSummary.remoteFallbackConfigured || 0)
  && styleSummary.styles === (styleSummary.remoteFallbackReachable || 0)
  && (styleSummary.remoteFallbackBroken || 0) === 0
  && (styleSummary.missingManifest || 0) === 0
);

const payload = {
  generatedAt: new Date().toISOString(),
  summary: {
    blogStructuralClosed,
    blogCloudMigrationClosed,
    stylesStructuralClosed,
    stylesRemoteFallbackClosed,
    editorialStructuralClosed: blogStructuralClosed && stylesStructuralClosed,
  },
  blog: {
    totalPosts: blogSummary.totalPosts || 0,
    coveredPosts: coveredBlogPosts,
    publishedWithManifest: blogCoverage['published-manifest'] || 0,
    publishedWithRemoteCuratedAsset: blogCoverage['published-remote-curated'] || 0,
    genericBannerFallback: blogCoverage['generic-banner-fallback'] || 0,
    needsSearch: searchSummary.blogNeedsSearch || 0,
    heroUnsplashOrRemote: searchSummary.blogHeroUnsplashOrRemote || 0,
    cardUnsplashOrRemote: searchSummary.blogCardUnsplashOrRemote || 0,
    problematicDuplicates: repetitionSummary.problematicDuplicates || 0,
    allThreeEqual: repetitionSummary.allThreeEqual || 0,
  },
  styles: {
    totalStyles: styleSummary.styles || 0,
    localWebp: styleSummary.localWebp || 0,
    localSvg: styleSummary.localSvg || 0,
    publicReady: styleSummary.publicReady || 0,
    manifestEntries: styleSummary.manifestEntries || 0,
    resolvedPublicReachable: styleSummary.resolvedPublicReachable || 0,
    resolvedPublicBroken: styleSummary.resolvedPublicBroken || 0,
    remoteFallbackConfigured: styleSummary.remoteFallbackConfigured || 0,
    remoteFallbackReachable: styleSummary.remoteFallbackReachable || 0,
    remoteFallbackBroken: styleSummary.remoteFallbackBroken || 0,
    missingManifest: styleSummary.missingManifest || 0,
  },
  evidence: {
    blogStatus: 'blog-editorial-status.latest.json',
    editorialSearch: 'editorial-search-report.latest.json',
    blogRepetition: 'blog-image-repetition-audit.latest.json',
    styleStatus: 'style-editorial-status.latest.json',
  },
};

fs.writeFileSync(reportPath, JSON.stringify(payload, null, 2));
fs.writeFileSync(latestReportPath, JSON.stringify(payload, null, 2));

console.log(`Blog structural closed: ${payload.summary.blogStructuralClosed ? 'YES' : 'NO'}`);
console.log(`Blog cloud migration closed: ${payload.summary.blogCloudMigrationClosed ? 'YES' : 'NO'}`);
console.log(`Styles structural closed: ${payload.summary.stylesStructuralClosed ? 'YES' : 'NO'}`);
console.log(`Styles remote fallback closed: ${payload.summary.stylesRemoteFallbackClosed ? 'YES' : 'NO'}`);
console.log(`Editorial structural closed: ${payload.summary.editorialStructuralClosed ? 'YES' : 'NO'}`);
console.log(`Saved report to ${reportPath}`);
console.log(`Saved latest report to ${latestReportPath}`);
