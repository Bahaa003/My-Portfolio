# Publishing

The site is a static Astro build deployed to GitHub Pages.

## Automatic deployment

Every push to the `master` branch runs
`.github/workflows/deploy-pages.yml`. The workflow installs dependencies,
builds the site, and publishes the `dist/` directory to GitHub Pages.

The production URL is:

`https://bahaa003.github.io/My-Portfolio/`

In the repository settings, configure **Pages → Source** as **GitHub Actions**.

## Publishing content

Add or edit content under `src/content/`, then commit and push the changes.
The relevant content collections are:

- `src/content/projects/`
- `src/content/writeups/`
- `src/content/labs/`
- `src/content/blog/`

Only content with `draft: false` and non-private confidentiality is published.

## Local commands

```bash
npm install
npm run dev
npm run build
```

GitHub Pages is static hosting, so the former Netlify Functions-based admin
editor is not included. Content is published through GitHub commits.
