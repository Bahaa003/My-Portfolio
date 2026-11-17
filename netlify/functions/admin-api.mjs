import { createDecipheriv, createHash } from 'node:crypto';

const SESSION = 'portfolio_admin_session';
const COLLECTIONS = new Set(['blog', 'writeups']);
const IMAGE_TYPES = new Map([
  ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'], ['.png', 'image/png'],
  ['.webp', 'image/webp'], ['.gif', 'image/gif'],
]);

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function cookieValue(request, name) {
  const match = (request.headers.get('cookie') ?? '').match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function session(request) {
  try {
    const buffer = Buffer.from(cookieValue(request, SESSION), 'base64url');
    const decipher = createDecipheriv(
      'aes-256-gcm',
      createHash('sha256').update(required('ADMIN_SESSION_SECRET')).digest(),
      buffer.subarray(0, 12),
    );
    decipher.setAuthTag(buffer.subarray(12, 28));
    const data = JSON.parse(Buffer.concat([decipher.update(buffer.subarray(28)), decipher.final()]).toString());
    return data.expiresAt > Date.now() ? data : null;
  } catch {
    return null;
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function validCollection(value) {
  if (!COLLECTIONS.has(value)) throw new Error('Invalid collection.');
  return value;
}

function validFilename(value) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9-]{0,89}\.md$/.test(value)) {
    throw new Error('Invalid article filename.');
  }
  return value;
}

function validPath(collection, value) {
  const prefix = `src/content/${collection}/`;
  if (typeof value !== 'string' || !value.startsWith(prefix)) throw new Error('Invalid article path.');
  validFilename(value.slice(prefix.length));
  return value;
}

function safeSlug(value) {
  const slug = String(value ?? '').toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 80);
  if (!slug) throw new Error('A valid slug is required.');
  return slug;
}

function frontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  const fields = {};
  if (!match) return { fields, body: source };
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const raw = line.slice(separator + 1).trim();
    try { fields[key] = JSON.parse(raw); } catch { fields[key] = raw.replace(/^['"]|['"]$/g, ''); }
  }
  return { fields, body: match[2] };
}

async function github(request, path, options = {}) {
  const auth = session(request);
  if (!auth) return { response: json({ error: 'Authentication required.' }, 401) };
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const token = request.headers.get('x-csrf-token');
    if (!token || token !== auth.csrf) return { response: json({ error: 'Invalid CSRF token.' }, 403) };
  }
  const owner = required('GITHUB_REPO_OWNER');
  const repo = required('GITHUB_REPO_NAME');
  const branch = process.env.GITHUB_BRANCH || 'master';
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${auth.token}`,
      'x-github-api-version': '2022-11-28',
      ...(options.headers ?? {}),
    },
  });
  return { response, branch };
}

async function body(request) {
  const raw = await request.text();
  if (raw.length > 700_000) throw new Error('Request is too large.');
  return raw ? JSON.parse(raw) : {};
}

export default async (request) => {
  try {
    const url = new URL(request.url);
    const data = request.method === 'POST' ? await body(request) : {};
    const action = url.searchParams.get('action') || data.action || 'list';
    const collection = validCollection(url.searchParams.get('collection') || data.collection);

    if (action === 'list') {
      const result = await github(request, `src/content/${collection}?ref=${encodeURIComponent(process.env.GITHUB_BRANCH || 'master')}`);
      if (result.response.status === 401) return result.response;
      const items = await result.response.json();
      if (!result.response.ok) return json({ error: items.message || 'Could not list articles.' }, result.response.status);
      const articles = [];
      for (const item of items.filter((entry) => entry.type === 'file' && entry.name.endsWith('.md') && !entry.name.startsWith('_'))) {
        const file = await github(request, `${item.path}?ref=${encodeURIComponent(process.env.GITHUB_BRANCH || 'master')}`);
        const fileData = await file.response.json();
        const parsed = frontmatter(Buffer.from(fileData.content.replace(/\s/g, ''), 'base64').toString('utf8'));
        articles.push({
          name: item.name, path: item.path, sha: item.sha, ...parsed.fields,
          wordCount: parsed.body.trim().split(/\s+/).filter(Boolean).length,
        });
      }
      return json(articles.sort((a, b) => String(b.updatedDate || b.date).localeCompare(String(a.updatedDate || a.date))));
    }

    if (action === 'read') {
      const path = validPath(collection, url.searchParams.get('path') || '');
      const result = await github(request, `${path}?ref=${encodeURIComponent(process.env.GITHUB_BRANCH || 'master')}`);
      if (result.response.status === 401) return result.response;
      const value = await result.response.json();
      if (!result.response.ok) return json({ error: value.message || 'Could not read article.' }, result.response.status);
      return json({ path, sha: value.sha, content: Buffer.from(value.content.replace(/\s/g, ''), 'base64').toString('utf8') });
    }

    if (action === 'save') {
      const slug = safeSlug(data.slug);
      const filename = `${slug}.md`;
      const path = `src/content/${collection}/${filename}`;
      const content = String(data.content || '');
      if (!content || content.length > 500_000) throw new Error('Article content is invalid or too large.');
      const payload = {
        message: `${data.sha ? 'Update' : 'Add'} ${collection} article: ${filename}`,
        content: Buffer.from(content).toString('base64'),
        branch: process.env.GITHUB_BRANCH || 'master',
      };
      if (data.sha) payload.sha = data.sha;
      const result = await github(request, path, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (result.response.status === 401) return result.response;
      const value = await result.response.json();
      if (!result.response.ok) return json({ error: value.message || 'Could not save article.' }, result.response.status);
      if (data.previousPath && data.previousSha && data.previousPath !== path) {
        const oldPath = validPath(collection, data.previousPath);
        const removed = await github(request, oldPath, {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            message: `Rename ${collection} article to: ${filename}`,
            sha: data.previousSha,
            branch: process.env.GITHUB_BRANCH || 'master',
          }),
        });
        if (!removed.response.ok) {
          const removalError = await removed.response.json().catch(() => ({}));
          return json({ error: removalError.message || 'Article saved, but the previous slug could not be removed.' }, 409);
        }
      }
      return json({ ok: true, path, sha: value.content?.sha, commit: value.commit?.sha });
    }

    if (action === 'delete') {
      const path = validPath(collection, data.path || '');
      if (!data.sha) throw new Error('A file SHA is required.');
      const result = await github(request, path, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: `Delete ${collection} article`, sha: data.sha, branch: process.env.GITHUB_BRANCH || 'master' }),
      });
      if (result.response.status === 401) return result.response;
      const value = await result.response.json();
      if (!result.response.ok) return json({ error: value.message || 'Could not delete article.' }, result.response.status);
      return json({ ok: true });
    }

    if (action === 'upload') {
      const original = String(data.name || '');
      const extension = original.slice(original.lastIndexOf('.')).toLowerCase();
      const mime = IMAGE_TYPES.get(extension);
      if (!mime || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,99}$/.test(original)) throw new Error('Unsupported image filename.');
      if (typeof data.contentBase64 !== 'string' || data.contentBase64.length > 8_000_000) throw new Error('Image is too large.');
      const slug = safeSlug(data.slug);
      const path = `public/uploads/${collection}/${slug}/${Date.now()}-${original}`;
      const raw = data.contentBase64.replace(/^data:image\/[^;]+;base64,/, '');
      const bytes = Buffer.from(raw, 'base64');
      if (bytes.length > 6_000_000) throw new Error('Image is too large.');
      const result = await github(request, path, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: `Add ${collection} image: ${original}`,
          content: bytes.toString('base64'),
          branch: process.env.GITHUB_BRANCH || 'master',
        }),
      });
      if (result.response.status === 401) return result.response;
      const value = await result.response.json();
      if (!result.response.ok) return json({ error: value.message || 'Could not upload image.' }, result.response.status);
      return json({ ok: true, url: `/My-Portfolio/uploads/${collection}/${slug}/${path.split('/').pop()}`, mime });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : 'Admin API error.' }, 400);
  }
};
