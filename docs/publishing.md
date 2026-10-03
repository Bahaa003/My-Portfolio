# Publishing workflow

The private editor lives at `/admin`. It uses GitHub OAuth for login and the
GitHub Contents API through Netlify Functions. GitHub tokens never reach the
browser: the server keeps the token in an encrypted, HttpOnly session cookie.

## One-time setup

### 1. Create a GitHub OAuth App

In GitHub, open **Settings → Developer settings → OAuth Apps → New OAuth App**.
Use:

- **Application name:** Bahaa Portfolio Editor
- **Homepage URL:** `https://funny-salmiakki-7239ae.netlify.app`
- **Authorization callback URL:** `https://funny-salmiakki-7239ae.netlify.app/.netlify/functions/admin-auth?route=callback`

Copy the generated client ID and client secret. Never commit the secret.

### 2. Add Netlify environment variables

In **Netlify → Site configuration → Environment variables**, add:

| Variable | Value |
| --- | --- |
| `PUBLIC_SITE_URL` | `https://funny-salmiakki-7239ae.netlify.app` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `GITHUB_OAUTH_CALLBACK_URL` | The callback URL above |
| `GITHUB_ADMIN_USERNAME` | `Bahaa003` |
| `ADMIN_SESSION_SECRET` | A long random secret, at least 32 characters |
| `GITHUB_REPO_OWNER` | `Bahaa003` |
| `GITHUB_REPO_NAME` | `My-Portfolio` |
| `GITHUB_BRANCH` | `master` |

Set these variables for the production deploy context. Trigger a new deploy
after saving them.

## Publishing an article

1. Open `https://funny-salmiakki-7239ae.netlify.app/admin`.
2. Sign in with the GitHub account `Bahaa003`.
3. Select **Blog** or **Write-ups**.
4. Click **New article**, fill in the metadata, and write Markdown/MDX content.
5. Use the image controls for a cover image or images inside the article.
6. Click **Publish to GitHub**.

The editor creates an `.mdx` file under `src/content/blog/` or
`src/content/writeups/`. New article filenames are generated from the title.
The GitHub commit triggers Netlify, and the existing listing and dynamic slug
routes pick up the new published content automatically.

Only content with `draft: false` and non-private confidentiality is listed.
The editor currently publishes public content; confidential or private content
can still be managed manually in the repository when needed.

## Supported article content

Markdown and MDX support headings, links, lists, tables, fenced syntax-highlighted
code blocks, images, HTTP request/response blocks, and the existing write-up
callout components.

The editor API is protected by GitHub OAuth and checks the allowed username on
the server. It does not use Netlify Git Gateway or expose GitHub credentials to
client-side JavaScript.