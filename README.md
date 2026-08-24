# Portfolio Website

A personal portfolio website built with React, TypeScript, Vite, and Tailwind CSS.

## Tech stack

- **Vite** for development and production builds
- **React** and **TypeScript** for the app
- **Tailwind CSS** and **shadcn/ui** for styling and UI components
- **React Router** for client-side routing
- **TanStack Query** for data fetching and state management

## Local development

Requirements: Node.js and npm.

```bash
git clone https://github.com/Umer-Farooq-CS/portfolio.git
cd portfolio
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) or the next available port shown by Vite.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the sitemap and create a production build |
| `npm run build:gh-pages` | Build for GitHub Pages and add `404.html` for SPA routing |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check without emitting |
| `npm run test` | Run the test suite |
| `npm run verify` | Lint + typecheck + test (what CI gates on) |
| `npm run images` | Regenerate responsive AVIF/WebP variants from `src/assets` |
| `npm run og` | Regenerate `public/og-portfolio.png` (the social card) |
| `npm run sitemap` | Regenerate `public/sitemap.xml` |
| `npm run data` | Refresh the GitHub / contributions / arXiv snapshot in `src/data/generated` |
| `npm run cv` | Regenerate `public/umer-farooq-cv.pdf` by printing the `/cv` route (build first) |
| `npm run shots` | Screenshot every route (desktop/mobile, light/dark) and run the axe gate |
| `npm run a11y` | Accessibility scan only |

## Routes

`/` - `/projects` - `/projects/:slug` - `/about` - `/services` - `/lab` - `/cv` - `/uses` -
`/notes` (hidden until a note is published) - `/thanks` - 404

`/lab` holds the two runnable demos: a parallel speedup benchmark measured in the visitor's own
browser, and an exact 3-qubit circuit simulator that exports OpenQASM 3.0, Qiskit, and Cirq.

## Content

All site copy lives in `src/data/` and is validated by zod schemas:

- `profile.ts` — summary, education, certifications, skill groups
- `projects.ts` — every project; `domains` drives grouping and filtering
- `taxonomy.ts` — the closed list of domains (a project can't be grouped into a domain that isn't here)
- `siteLinks.ts` — the single source for GitHub, LinkedIn, email, phone, location
- `schema.ts` — the schemas; `src/test/content.test.ts` fails the build on invalid content

Editing content is a data change: update the file, run `npm run verify`.

## Images

Source images live in `src/assets/`. `npm run images` generates responsive AVIF/WebP
variants into `src/assets/optimized/` plus a typed manifest, which the `Picture`
component consumes. Commit the generated files.

## Plan

The in-progress redesign is documented in [REDESIGN_PLAN.md](./REDESIGN_PLAN.md);
pending content updates are tracked in [TODO-CONTENT.md](./TODO-CONTENT.md).

## GitHub Pages (deploy to username.github.io)

This project is configured for GitHub Pages with a relative Vite base path (`base: "./"`), so it works for:

- **Project site:** `https://<username>.github.io/<repo-name>/`
- **User site:** `https://<username>.github.io/` (if repo name is `username.github.io`)

**Full step-by-step:** see **[GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md)** for:

- Creating the repo (suggested name, description, topics)
- First-time Git init, commit, and push
- Enabling Pages (Source: **GitHub Actions**)
- Your live URL and troubleshooting

### One-time setup (summary)

1. Create a **public** repo (e.g. name: `portfolio`, description: *Personal portfolio – AI & HPC projects, experience, and contact.*).
2. Locally: `git init`, `git add .`, `git commit -m "Initial commit"`, `git branch -M main`, `git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git`, `git push -u origin main`.
3. On GitHub: **Settings → Pages → Source: GitHub Actions**.

Every push to `main` then builds and deploys automatically.

### Manual build (test locally)

```bash
npm run build:gh-pages
```

## Project structure

- `src/` contains the React application
- `public/` contains static assets
- `index.html` is the HTML entry point
- `vite.config.ts` contains the Vite and GitHub Pages setup

## License

Private personal website.
