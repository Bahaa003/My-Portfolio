import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const cookieName = 'portfolio_admin_session';
const stateCookieName = 'portfolio_oauth_state';

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

function cookie(name, value, options = {}) {
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=None',
  ];
  if (options.maxAge !== undefined) attributes.push(`Max-Age=${options.maxAge}`);
  return attributes.join('; ');
}

function sessionKey() {
  return createHash('sha256').update(required('ADMIN_SESSION_SECRET')).digest();
}

function seal(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', sessionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}

function unseal(value) {
  try {
    const buffer = Buffer.from(value, 'base64url');
    const decipher = createDecipheriv('aes-256-gcm', sessionKey(), buffer.subarray(0, 12));
    decipher.setAuthTag(buffer.subarray(12, 28));
    const plaintext = Buffer.concat([decipher.update(buffer.subarray(28)), decipher.final()]).toString();
    const session = JSON.parse(plaintext);
    return session.expiresAt > Date.now() ? session : null;
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

function redirect(url, headers = {}) {
  const responseHeaders = new Headers({ location: url });
  for (const [name, value] of Object.entries(headers)) {
    if (Array.isArray(value)) value.forEach((item) => responseHeaders.append(name, item));
    else responseHeaders.set(name, value);
  }
  return new Response(null, { status: 302, headers: responseHeaders });
}

export default async (request) => {
  const url = new URL(request.url);
  const route = url.searchParams.get('route') ?? 'start';

  try {
    if (route === 'start') {
      const state = randomBytes(24).toString('base64url');
      const callback = required('GITHUB_OAUTH_CALLBACK_URL');
      const params = new URLSearchParams({
        client_id: required('GITHUB_CLIENT_ID'),
        redirect_uri: callback,
        scope: 'public_repo',
        state,
      });
      return redirect(`https://github.com/login/oauth/authorize?${params}`, {
        'set-cookie': cookie(stateCookieName, state, { maxAge: 600 }),
      });
    }

    if (route === 'callback') {
      const state = url.searchParams.get('state') ?? '';
      const expectedState = cookieValue(request, stateCookieName);
      if (!state || !expectedState || state.length !== expectedState.length || !timingSafeEqual(Buffer.from(state), Buffer.from(expectedState))) {
        return json({ error: 'Invalid OAuth state.' }, { status: 400 });
      }

      const code = url.searchParams.get('code');
      if (!code) return json({ error: 'GitHub did not return an authorization code.' }, { status: 400 });

      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({
          client_id: required('GITHUB_CLIENT_ID'),
          client_secret: required('GITHUB_CLIENT_SECRET'),
          code,
          redirect_uri: required('GITHUB_OAUTH_CALLBACK_URL'),
        }),
      });
      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) return json({ error: 'GitHub authorization failed.' }, { status: 401 });

      const userResponse = await fetch('https://api.github.com/user', {
        headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${tokenData.access_token}` },
      });
      const user = await userResponse.json();
      if (!user.login || user.login.toLowerCase() !== required('GITHUB_ADMIN_USERNAME').toLowerCase()) {
        return json({ error: 'This GitHub account is not allowed to access the editor.' }, { status: 403 });
      }

      const session = seal({ token: tokenData.access_token, login: user.login, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
      return redirect(`${required('PUBLIC_SITE_URL').replace(/\/$/, '')}/admin?login=success`, {
        'set-cookie': cookie(cookieName, session, { maxAge: 8 * 60 * 60 }),
      });
    }

    if (route === 'me') {
      const session = unseal(cookieValue(request, cookieName));
      return session ? json({ authenticated: true, login: session.login }) : json({ authenticated: false }, { status: 401 });
    }

    if (route === 'logout') {
      return redirect(`${required('PUBLIC_SITE_URL').replace(/\/$/, '')}/admin`, {
        'set-cookie': cookie(cookieName, '', { maxAge: 0 }),
      });
    }

    return json({ error: 'Unknown auth route.' }, { status: 404 });
  } catch (error) {
    console.error(error);
    return json({ error: 'Authentication service is not configured.' }, { status: 500 });
  }
};