# GitHub Pages deployment – step-by-step

Follow these steps to push your portfolio to GitHub and publish it on GitHub Pages (`.github.io` style).

---

## 1. Create the repository on GitHub

1. Go to **https://github.com/new** (or click **+** → **New repository**).
2. Fill in:

   | Field | Suggested value |
   |--------|------------------|
   | **Repository name** | `portfolio` or `umer-farooq-portfolio` (use lowercase, hyphens only). |
   | **Description** | `Personal portfolio – AI & HPC projects, experience, and contact.` |
   | **Visibility** | **Public** (required for GitHub Pages free tier). |
   | **Initialize** | Leave **unchecked** (no README, .gitignore, or license – we already have these). |

3. Click **Create repository**.

---

## 2. (Optional) Add topics and settings

- On the repo page, click the **⚙️** (gear) next to **About**.
- **Topics:** add e.g. `portfolio`, `react`, `vite`, `github-pages`, `personal-website`.
- **Website:** leave empty for now; after Pages is enabled, the URL will be shown there.

---

## 3. Initialize Git and push from your machine

Open a terminal in the project folder (e.g. `A2 Loveable` or wherever the project lives) and run:

```bash
# Go to project folder (adjust path if needed)
cd "d:\University\Uni\Semester 8\Digital Marketing\A2 Loveable"

# Initialize Git
git init

# Stage all files
git add .

# First commit
git commit -m "Initial commit: portfolio with projects, about, services, GitHub Pages setup"

# Rename branch to main (GitHub default)
git branch -M main

# Add your GitHub repo as remote (replace YOUR_USERNAME and REPO_NAME with your values)
# Examples:
#   User site:    https://github.com/Umer-Farooq-CS/Umer-Farooq-CS.github.io.git
#   Project site: https://github.com/Umer-Farooq-CS/portfolio.git
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

- Replace **YOUR_USERNAME** with your GitHub username (e.g. `Umer-Farooq-CS`).
- Replace **REPO_NAME** with the repo you created (e.g. `portfolio` or `umer-farooq-portfolio`).

If GitHub asks for auth, use a **Personal Access Token** (Settings → Developer settings → Personal access tokens) or **GitHub CLI** (`gh auth login`).

---

## 4. Turn on GitHub Pages (Actions)

1. In the repo on GitHub, go to **Settings** → **Pages** (left sidebar).
2. Under **Build and deployment**:
   - **Source:** choose **GitHub Actions** (not “Deploy from a branch”).
3. Save if needed.

After the next push to `main`, the **“Deploy to GitHub Pages”** workflow will run automatically (see **Actions** tab).

---

## 5. Your site URL

- **Project site** (repo name e.g. `portfolio`):
  - **URL:** `https://YOUR_USERNAME.github.io/REPO_NAME/`
  - Example: `https://Umer-Farooq-CS.github.io/portfolio/`
- **User/org site** (repo name exactly `YOUR_USERNAME.github.io`):
  - **URL:** `https://YOUR_USERNAME.github.io/`
  - Example: `https://Umer-Farooq-CS.github.io/`

This project uses `base: "./"` in Vite, so it works for both. Use the URL that matches your repo name.

---

## 6. After the first deploy

1. Open the **Actions** tab and confirm the workflow run for “Deploy to GitHub Pages” is green.
2. Visit your Pages URL (from step 5). It may take 1–2 minutes the first time.
3. (Optional) In **Settings → Pages**, copy the “Your site is live at …” URL into the repo **About → Website** for a nice link on the repo.

---

## 7. Later: update the site

From the project folder:

```bash
git add .
git commit -m "Your commit message"
git push
```

Each push to `main` triggers a new build and deploy. The live site updates after the workflow finishes.

---

## 8. (Optional) Contact form – Formspree

The contact form uses [Formspree](https://formspree.io) so submissions are emailed to you. To enable it:

1. Sign up at **https://formspree.io** and create a new form.
2. Copy your **form ID** from the form’s endpoint (e.g. `https://formspree.io/f/abc123xy` → ID is `abc123xy`).
3. **Local:** Create a `.env` in the project root (copy from `.env.example`) and set:
   ```bash
   VITE_FORMSPREE_FORM_ID=abc123xy
   ```
4. **GitHub Pages:** In the repo go to **Settings → Secrets and variables → Actions**, add a secret:
   - **Name:** `VITE_FORMSPREE_FORM_ID`
   - **Value:** your form ID (e.g. `abc123xy`)
   The deploy workflow already passes this into the build; the next deploy will use it.
5. If the secret is not set, the form shows a friendly error asking visitors to email you directly.

---

## Troubleshooting

| Issue | What to do |
|--------|------------|
| 404 on refresh or direct link | The workflow copies `index.html` to `404.html` for SPA routing. Ensure **Source** is **GitHub Actions** and the last workflow run succeeded. |
| Blank or broken page | Check that **Repository name** and **base** match: if the repo is `portfolio`, the site must be opened at `.../portfolio/` (with trailing slash). |
| Build fails in Actions | Open the failed run, expand the failing step (e.g. “Build for GitHub Pages”), and fix the reported error (often dependency or Node version). |
| Auth errors on push | Use a Personal Access Token with `repo` scope, or run `gh auth login` and push again. |

---

## Quick reference

- **Repo name:** `portfolio` (or `your-username.github.io` for user site).
- **Description:** `Personal portfolio – AI & HPC projects, experience, and contact.`
- **Branch:** `main`.
- **Pages source:** **GitHub Actions**.
- **Live URL (project site):** `https://<username>.github.io/<repo-name>/`
