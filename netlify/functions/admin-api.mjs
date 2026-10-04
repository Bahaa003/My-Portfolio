import { createDecipheriv, createHash } from 'node:crypto';

const cookieName = 'portfolio_admin_session';
const collections = new Set(['blog', 'writeups']);
const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing Netlify environment variable: ${name}`);
  return value;
}

function cookieValue(request, name) {
  const cookies = request.headers.get('cookie') ?? '';
  const match = cookies.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function session(request) {
  try {
    const value = cookieValue(request, cookieName);
    const buffer = Buffer.from(value, 'base64url');
    const decipher = createDecipheriv('aes-256-gcm', createHash('sha256').update(required('ADMIN_SESSION_SECRET')).digest(), buffer.subarray(0, 12));
    decipher.setAuthTag(buffer.subarray(12, 28));
    const data = JSON.parse(Buffer.concat([decipher.update(buffer.subarray(28)), decipher.final()]).toString());
    return data.expiresAt > Date.now() ? data : null;
  } catch {
    return null;
  }
}

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers ?? {}) },
  });
}

function collection(value) {
  if (!collections.has(value)) throw new Error('Invalid collection.');
  return value;
}

function filename(value) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,99}\.mdx$/.test(value)) throw new Error('Invalid article filename.');
  return value;
}

function imageFilename(value) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,99}$/.test(value)) throw new Error('Invalid image filename.');
  const extension = value.slice(value.lastIndexOf('.')).toLowerCase();
  if (!allowedImageExtensions.has(extension)) throw new Error('Unsupported image type.');
  return value;
}

function contentPath(collectionName, name) {
  return `src/content/${collectionName}/${name}`;
}

function articlePath(collectionName, value) {
  const prefix = `src/content/${collectionName}/`;
  if (typeof value !== 'string' || !value.startsWith(prefix)) throw new Error('Invalid article path.');
  const name = value.slice(prefix.length);
  filename(name);
  return `${prefix}${name}`;
}

async function github(request, path, options = {}) {
  const sessionData = session(request);
  if (!sessionData) return { response: json({ error: 'Authentication required.' }, { status: 401 }) };
  const owner = required('GITHUB_REPO_OWNER');
  const repo = required('GITHUB_REPO_NAME');
  const branch = process.env.GITHUB_BRANCH || 'master';
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${sessionData.token}`,
      'x-github-api-version': '2022-11-28',
      ...(options.headers ?? {}),
    },
  });
  return { response, branch };
}

function decodeContent(encoded) {
  return Buffer.from(encoded.replace(/\s/g, ''), 'base64').toString('utf8');
}

export default async (request) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'list';
    let body = null;
    if (request.method === 'POST') {
      const rawBody = await request.text();
      body = rawBody ? JSON.parse(rawBody) : null;
    }
    const collectionName = collection(url.searchParams.get('collection') || body?.collection);

    if (action === 'list') {
      const { response } = await github(request, `src/content/${collectionName}`);
      if (response instanceof Response && response.status === 401) return response;
      const data = await response.json();
      if (!response.ok) return json({ error: data.message || 'Could not list articles.' }, { status: response.status });
      const entries = data
        .filter((item) => item.type === 'file' && item.name.endsWith('.mdx') && !item.name.startsWith('_'))
        .map((item) => ({ name: item.name, path: item.path, sha: item.sha }));
      return json(entries);
    }

    if (action === 'read') {
      const path = articlePath(collectionName, url.searchParams.get('path') || '');
      const { response } = await github(request, path);
      if (response.status === 401) return response;
      const data = await response.json();
      if (!response.ok) return json({ error: data.message || 'Could not read article.' }, { status: response.status });
      return json({ path, sha: data.sha, content: decodeContent(data.content) });
    }

    if (action === 'save') {
      const name = filename(body.name);
      const path = contentPath(collectionName, name);
      if (typeof body.content !== 'string' || body.content.length > 500000) throw new Error('Article content is too large.');
      const requestData = { message: `${body.sha ? 'Update' : 'Add'} ${collectionName} article: ${name}`, content: Buffer.from(body.content).toString('base64'), branch: process.env.GITHUB_BRANCH || 'master' };
      if (body.sha) requestData.sha = body.sha;
      const { response } = await github(request, path, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(requestData) });
      if (response.status === 401) return response;
      const data = await response.json();
      if (!response.ok) return json({ error: data.message || 'Could not save article.' }, { status: response.status });
      return json({ ok: true, path, commit: data.commit?.sha });
    }

    if (action === 'delete') {
      const path = articlePath(collectionName, url.searchParams.get('path') || '');
      const sha = url.searchParams.get('sha') || '';
      if (!sha) throw new Error('Invalid delete request.');
      const { response } = await github(request, path, { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: `Delete ${collectionName} article`, sha, branch: process.env.GITHUB_BRANCH || 'master' }) });
      if (response.status === 401) return response;
      const data = await response.json();
      if (!response.ok) return json({ error: data.message || 'Could not delete article.' }, { status: response.status });
      return json({ ok: true });
    }

    if (action === 'upload') {
      const name = imageFilename(body.name);
      const slug = String(body.slug || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 100);
      if (!slug || typeof body.contentBase64 !== 'string' || body.contentBase64.length > 7_000_000) throw new Error('Invalid image upload.');
      const path = `public/uploads/${collectionName}/${slug}/${name}`;
      const current = await github(request, path);
      if (current.response.status === 401) return current.response;
      const currentData = current.response.ok ? await current.response.json() : null;
      const upload = { message: `${currentData ? 'Update' : 'Add'} image for ${collectionName} article: ${name}`, content: body.contentBase64.replace(/^data:image\/[^;]+;base64,/, ''), branch: process.env.GITHUB_BRANCH || 'master' };
      if (currentData?.sha) upload.sha = currentData.sha;
      const { response } = await github(request, path, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(upload) });
      if (response.status === 401) return response;
      const data = await response.json();
      if (!response.ok) return json({ error: data.message || 'Could not upload image.' }, { status: response.status });
      return json({ ok: true, url: `/uploads/${collectionName}/${slug}/${name}` });
    }

    return json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return json({ error: error.message || 'Admin API error.' }, { status: 400 });
  }
};