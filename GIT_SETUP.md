# Push this project to Git

Follow these steps in your terminal (in the project folder).

---

## 1. One-time Git config (if not done already)

Set your name and email so commits are attributed to you:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 2. Create a new repository online

- **GitHub:** https://github.com/new  
- **GitLab:** https://gitlab.com/projects/new  
- **Bitbucket:** https://bitbucket.org/repo/create  

Create an **empty** repo (no README, no .gitignore). Copy the repo URL, e.g.:

- `https://github.com/yourusername/Varahitraders.git`  
- or `git@github.com:yourusername/Varahitraders.git` (SSH)

---

## 3. Initialize Git and push (run from project folder)

Open Terminal, go to the project folder, then run:

```bash
cd /Users/ysuresh/Documents/MyApps/Varahitraders

# Initialize Git
git init

# Add all files (respects .gitignore: no node_modules, .env, prisma/*.db)
git add .

# First commit
git commit -m "Initial commit: Varahi Traders inventory and billing app"

# Rename default branch to main (optional, GitHub default)
git branch -M main

# Add your remote (replace with YOUR repo URL from step 2)
git remote add origin https://github.com/YOUR_USERNAME/Varahitraders.git

# Push to remote
git push -u origin main
```

---

## 4. If you use SSH instead of HTTPS

If your remote URL is like `git@github.com:user/Varahitraders.git`:

```bash
git remote add origin git@github.com:YOUR_USERNAME/Varahitraders.git
git push -u origin main
```

Make sure you have an SSH key added to your GitHub/GitLab account.

---

## 5. Later: make changes and push again

```bash
git add .
git commit -m "Describe what you changed"
git push
```

---

## Notes

- **`.env`** is in `.gitignore` — it will **not** be pushed. Keep secrets only in `.env` and use `.env.example` for sample config.
- **`prisma/*.db`** is ignored — your SQLite database stays local.
- If `git push` asks for username/password on HTTPS, use a **Personal Access Token** (GitHub: Settings → Developer settings → Personal access tokens) instead of your account password.
