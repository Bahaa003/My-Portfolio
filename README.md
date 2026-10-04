# Bahaa Aldeen Nawlo — Security Portfolio

A static Astro + TypeScript + MDX portfolio for a junior penetration tester,
covering write-ups, security work, training labs, blog posts, a CV, and
YouTube videos. Dark-first, minimal, editorial design system driven entirely
by CSS custom properties.

## Stack

- Astro (static output) + TypeScript (strict)
- MDX via Astro Content Collections (Content Layer `glob` loader)
- Hand-written modern CSS (no Tailwind, per project brief)
- `@astrojs/sitemap`, `@astrojs/rss`
- `@lucide/astro` for icons

## Commands

| Command             | Action                                      |
| -------------------- | -------------------------------------------- |
| `npm install`         | Install dependencies                          |
| `npm run dev`          | Start local dev server at `localhost:4321`    |
| `npm run build`        | Build the production site to `./dist/`        |
| `npm run preview`      | Preview the production build locally          |
| `npx astro check`      | Type-check `.astro`/`.ts` files               |

## Project structure

```
src/
├── config/site.ts        Site identity, navigation, social links, SEO defaults
├── data/
│   ├── profile.ts         Short factual bio (homepage + /about)
│   ├── cv.ts               Structured CV data — renders /cv directly
│   └── youtube.ts          Config-driven video list (no API integration yet)
├── content.config.ts      Content collection schemas (writeups/projects/labs/blog)
├── content/                MDX/Markdown content files, one folder per collection
├── components/             UI, layout, home-section, and content-type components
├── layouts/                 BaseLayout, ArticleLayout, CvLayout
├── lib/
│   ├── collections.ts       Central draft/confidentiality filtering — always use
│   │                          these helpers rather than calling getCollection directly
│   └── readingTime.ts
└── pages/                    File-based routes, including [slug] dynamic routes
```

## Adding content

Copy the matching `_example-template.mdx` (or `.md`) file inside
`src/content/<collection>/`, fill in the frontmatter and body, and set
`draft: false` when ready to publish. Nothing else needs to change — listing
pages, the homepage, and the RSS feed all pick it up automatically.

**Confidentiality:** set `confidentiality: "redacted"` for professional work
that needs generalized/redacted details, or `"private"` for anything that
should never render publicly. Both are enforced centrally in
`src/lib/collections.ts`, not per-page — never bypass those helpers by
calling `getCollection()` directly in a page.

## Before deploying

Search the codebase for `TODO` — every one marks information that was
deliberately left as a placeholder rather than invented:

- `src/config/site.ts` — production domain, social handles, security contact
- `src/data/cv.ts` — employer/institution names, exact dates, tools list
- `public/og-default.svg` — replace with a real 1200×630 PNG/JPG
- `public/.well-known/security.txt` — real public security contact
- `public/images/profile/profile-placeholder.svg` — real profile photo
- `docs/security-headers.md` — enable HSTS only once the domain/HTTPS setup is final

## Security headers

See `docs/security-headers.md`. `public/_headers` covers Netlify/Cloudflare
Pages; other hosts need the equivalent config ported over at deploy time.

## Portfolio launch checklist

Before publishing:

- Replace `public/og-default.svg` with a real 1200×630 PNG/JPG.
- Confirm the production domain in `src/config/site.ts`.
- Keep client/security-assessment details generalized unless explicit permission exists to publish them.
- Add real write-ups/labs/blog posts as they are ready; do not publish placeholders as finished work.
- Add the real YouTube channel URL when the channel exists.
- Verify `public/.well-known/security.txt` and the public contact address.
- Enable HSTS only after the production domain is confirmed to be HTTPS-only and the deployment configuration is verified.

## GitHub Pages deployment

The production static site is configured for GitHub Pages at
`https://bahaa003.github.io/My-Portfolio`. Pushes to `master` run
`.github/workflows/deploy-pages.yml` and publish the `dist/` directory.

The `/admin` publishing studio depends on Netlify Functions and is not
available on GitHub Pages. Publish content by committing it to the repository
or keep the Netlify site available separately for the editor.
