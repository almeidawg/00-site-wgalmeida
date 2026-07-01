const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const KEY_FILE = 'C:\\Users\\Atendimento\\Documents\\_GRUPO_WG_ALMEIDA\\01_APPS\\02_BUILDTECH\\04_OPERACIONAL\\07_20260310_Infraestrutura\\Google\\wg-easy-sistema-8f3bd24edcc2.json';
const SITE_URL = 'https://wgalmeida.com.br/';
const SITEMAP_URL = 'https://wgalmeida.com.br/sitemap.xml';

async function submitSitemap() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/webmasters'],
    });

    const searchconsole = google.searchconsole({ version: 'v1', auth });

    console.log(`[Google] Submitting sitemap ${SITEMAP_URL} for ${SITE_URL}...`);
    
    await searchconsole.sitemaps.submit({
      siteUrl: SITE_URL,
      feedpath: SITEMAP_URL,
    });

    console.log('[Google] Sitemap submitted successfully.');
  } catch (error) {
    console.error('[Google] Error submitting sitemap:', error.message);
  }
}

submitSitemap();
