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

## Private publishing studio

The public site remains on GitHub Pages, while `/admin` and the backend
functions are deployed to a separate Netlify site. The studio uses GitHub OAuth,
the GitHub Contents API, and encrypted HttpOnly sessions. GitHub tokens never
reach the browser.

Configure these Netlify environment variables:

| Variable | Value |
| --- | --- |
| `PUBLIC_SITE_URL` | The Netlify URL used for the studio |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `GITHUB_OAUTH_CALLBACK_URL` | `<PUBLIC_SITE_URL>/.netlify/functions/admin-auth?route=callback` |
| `GITHUB_ADMIN_USERNAME` | `Bahaa003` |
| `ADMIN_SESSION_SECRET` | A random secret of at least 32 characters |
| `GITHUB_REPO_OWNER` | `Bahaa003` |
| `GITHUB_REPO_NAME` | `My-Portfolio` |
| `GITHUB_BRANCH` | `master` |

Set the GitHub OAuth App homepage and callback URL to the Netlify studio
domain. Deploy this repository as a second Netlify site using `netlify.toml`,
then open `<PUBLIC_SITE_URL>/admin`.

The editor supports Blog and Write-up metadata, drafts, publishing,
unpublishing by saving as a draft, preview, deletion with confirmation, rich
text, lists, tables, links, code blocks with language labels, and image upload
from the file picker, drag-and-drop, or clipboard. Images are committed under
`public/uploads/blog/` or `public/uploads/writeups/`.

Saving a draft keeps `draft: true`, so the central filtering helpers continue
to exclude it from public listings, routes, and RSS. Publishing sets
`draft: false`; the GitHub Pages workflow then rebuilds the public site.

The GitHub Pages site itself remains static. It does not execute the private
Netlify functions.
