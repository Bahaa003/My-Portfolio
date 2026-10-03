# Production security headers

This is a fully static site, so security headers are applied by the hosting
platform/CDN, not by application code. `public/_headers` covers Netlify and
Cloudflare Pages out of the box.

## Headers included

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera, microphone, geolocation and FLoC disabled
- `Content-Security-Policy` — restrictive default; **must be reviewed** if
  external scripts/fonts/embeds (e.g. YouTube embeds) are added later, since
  the current policy only allows same-origin script/style/font sources
  (plus inline styles, which Astro's scoped CSS needs).

## Deliberately not set yet: `Strict-Transport-Security`

HSTS is powerful and dangerous to get wrong: once a browser caches a
`max-age`, it will refuse plain HTTP for that domain for the full duration,
even if HTTPS breaks later. It should only be enabled once:

1. The production domain is final (see `TODO` in `src/config/site.ts`).
2. HTTPS is confirmed working correctly on that domain, including any
   subdomains covered by `includeSubDomains`.

Suggested value once ready (see the commented line in `public/_headers`):

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

Start with a short `max-age` (e.g. a few hours) while testing, then raise it
once confirmed stable, before considering HSTS preload submission.

## If deploying to Vercel instead

Netlify/Cloudflare's `_headers` file format isn't read by Vercel. Port the
same rules into a `vercel.json` `headers` array. Ask for this file to be
generated once the hosting platform is decided.

## If deploying to a custom server (nginx/Caddy/etc.)

Port the same header values into that server's config (e.g. `add_header` in
nginx). Do this at the point of deployment, since the static host determined
here is a placeholder.
