import { requireAdmin } from './_adminAuth.js';
import { syncBlogCms } from './_blogCms.js';

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
};

const parseBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return json(res, 200, { ok: true, mode: 'blog-cms' });
  }

  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const adminAuth = await requireAdmin(req, res);
  if (!adminAuth.ok) return adminAuth.response;

  try {
    const body = await parseBody(req);
    const result = await syncBlogCms({
      posts: body.posts || {},
      taxonomies: body.taxonomies || {},
      source: body.source || 'admin-blog-cms',
    });
    return json(res, 200, result);
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: error?.message || 'Failed to sync blog CMS.',
    });
  }
}
