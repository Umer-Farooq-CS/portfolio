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
git clone <YOUR_REPO_URL>
cd portfolio-website
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) or the next available port shown by Vite.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run build:gh-pages` | Build for GitHub Pages and add `404.html` for SPA routing |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

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
