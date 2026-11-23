// Test-only loader: never contacts Google or reads live OAuth credentials.
// Node 24 registerHooks substitutes both third-party dependencies with in-memory fixtures.
import { registerHooks } from 'node:module';

const fakeModules = {
  dotenv: `export default { config: () => ({ parsed: {} }) }`,
  googleapis: `export const google = { auth: { GoogleAuth: class {
    constructor({ scopes }) {
      const expected = process.argv.includes('submit-sitemap')
        ? 'https://www.googleapis.com/auth/webmasters'
        : 'https://www.googleapis.com/auth/webmasters.readonly';
      if (scopes?.[0] !== expected) throw new Error('Test fixture refused incorrect OAuth scope');
    }
    async getClient() { return { getAccessToken: async () => { if (process.env.GSC_INDEXING_INTEGRATION_CASE === 'token_unavailable') throw new Error('invalid authentication credentials'); return { token: 'TEST_ONLY_NO_REAL_TOKEN' }; } } }
  } } }`,
};
const urls = Object.fromEntries(Object.entries(fakeModules).map(([key, source]) => [
  key, 'data:text/javascript,' + encodeURIComponent(source),
]));
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (Object.hasOwn(urls, specifier)) return { url: urls[specifier], shortCircuit: true };
    return nextResolve(specifier, context);
  },
});

const scenario = process.env.GSC_INDEXING_INTEGRATION_CASE;
if (!['auth_scope', 'success', 'partial_rate', 'invalid_response', 'token_unavailable', 'submit_mock'].includes(scenario)) {
  throw new Error('Integration fixture scenario missing or invalid');
}
let requests = 0;
const success = (coverageState) => ({
  inspectionResult: {
    indexStatusResult: {
      verdict: coverageState === 'Submitted and indexed' ? 'PASS' : 'NEUTRAL',
      coverageState,
      indexingState: 'INDEXING_ALLOWED',
      pageFetchState: 'SUCCESSFUL',
      robotsTxtState: 'ALLOWED',
    },
  },
});
const errorBody = (message) => ({ error: { message } });

globalThis.fetch = async (url, options = {}) => {
  if (scenario === 'submit_mock') {
    if (!String(url).startsWith('https://www.googleapis.com/webmasters/v3/sites/') || options.method !== 'PUT') {
      throw new Error('Unexpected submission endpoint blocked by integration fixture');
    }
    return { ok: true, status: 200, text: async () => '{}' };
  }
  if (url !== 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect' ||
      options.method !== 'POST' || !options.body) {
    throw new Error('Unexpected external API endpoint blocked by integration fixture');
  }
  const body = JSON.parse(options.body);
  if (body.siteUrl !== 'sc-domain:wgalmeida.com.br' ||
      !String(body.inspectionUrl).startsWith('https://wgalmeida.com.br')) {
    throw new Error('Unexpected property or URL blocked by integration fixture');
  }
  requests += 1;
  let httpStatus = 200;
  let payload = success('Submitted and indexed');
  if (scenario === 'auth_scope') {
    httpStatus = 403;
    payload = errorBody('Request had insufficient authentication scopes.');
  } else if (scenario === 'success' && requests === 2) {
    payload = success('Crawled - currently not indexed');
  } else if (scenario === 'partial_rate' && requests === 2) {
    httpStatus = 429;
    payload = errorBody('Quota exceeded, HTTP 429');
  } else if (scenario === 'invalid_response') {
    payload = { inspectionResult: {} };
  }
  return {
    ok: httpStatus >= 200 && httpStatus < 300,
    status: httpStatus,
    text: async () => JSON.stringify(payload),
  };
};
