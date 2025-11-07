# GitHub Pages Setup Guide

This guide will help you deploy the SysML v2 web interface to GitHub Pages.

## Method 1: Using GitHub Pages Branch (Recommended)

### Step 1: Run the Deployment Script

```bash
# Make the script executable
chmod +x deploy-gh-pages.sh

# Run the deployment
./deploy-gh-pages.sh
```

This script will:
- Create a `gh-pages` branch
- Copy only the necessary web files
- Push to GitHub

### Step 2: Enable GitHub Pages

1. Go to your GitHub repository: `https://github.com/<username>/SysML`
2. Click on **Settings** tab
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click **Save**

### Step 3: Access Your Site

Your site will be available at:
```
https://<username>.github.io/SysML/
```

GitHub will take 1-2 minutes to build and deploy your site.

---

## Method 2: Manual Deployment to gh-pages Branch

If you prefer manual control:

```bash
# Ensure you're on your main branch with all changes committed
git checkout claude/sysml-v2-lexer-parser-generator-011CUttB51DFXmyNZotisz4M

# Create and switch to gh-pages branch
git checkout --orphan gh-pages

# Remove all files
git rm -rf .

# Copy only web interface files
git checkout claude/sysml-v2-lexer-parser-generator-011CUttB51DFXmyNZotisz4M -- index.html lexer.js parser.js generator.js README.md

# Create .nojekyll file (tells GitHub not to use Jekyll)
touch .nojekyll

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push -u origin gh-pages

# Switch back to your main branch
git checkout claude/sysml-v2-lexer-parser-generator-011CUttB51DFXmyNZotisz4M
```

Then follow Step 2 and Step 3 from Method 1.

---

## Method 3: Using Main Branch with Docs Folder

### Step 1: Create docs directory

```bash
# Create docs folder
mkdir -p docs

# Copy web files to docs
cp index.html docs/
cp lexer.js docs/
cp parser.js docs/
cp generator.js docs/
cp .nojekyll docs/

# Commit and push
git add docs/
git commit -m "Add docs folder for GitHub Pages"
git push
```

### Step 2: Configure GitHub Pages

1. Go to repository Settings → Pages
2. Under **Source**, select:
   - Branch: `claude/sysml-v2-lexer-parser-generator-011CUttB51DFXmyNZotisz4M` (or your main branch)
   - Folder: `/docs`
3. Click **Save**

Your site will be at: `https://<username>.github.io/SysML/`

---

## Method 4: Using Main Branch Root

### Step 1: Move web files to root (if not already there)

The files are already in the root, so this is already done:
- `index.html`
- `lexer.js`
- `parser.js`
- `generator.js`
- `.nojekyll`

### Step 2: Configure GitHub Pages

1. Go to repository Settings → Pages
2. Under **Source**, select:
   - Branch: `claude/sysml-v2-lexer-parser-generator-011CUttB51DFXmyNZotisz4M` (or your main branch)
   - Folder: `/ (root)`
3. Click **Save**

---

## Troubleshooting

### Site not loading?

1. **Check GitHub Actions**: Go to Actions tab to see if deployment succeeded
2. **Wait a few minutes**: Initial deployment can take 2-5 minutes
3. **Clear browser cache**: Hard refresh with Ctrl+F5 (or Cmd+Shift+R on Mac)
4. **Check .nojekyll exists**: This file must be present to bypass Jekyll processing

### JavaScript files not loading?

- Ensure all `.js` files are committed to your gh-pages branch
- Check browser console (F12) for errors
- Verify files are in the same directory as `index.html`

### 404 Error?

- Make sure `index.html` is in the root of your selected folder/branch
- Check that GitHub Pages is enabled in Settings → Pages
- Verify the branch and folder settings are correct

---

## Custom Domain (Optional)

To use a custom domain like `sysml-tools.yourdomain.com`:

1. Add a file named `CNAME` with your domain:
   ```bash
   echo "sysml-tools.yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. Configure DNS records at your domain provider:
   - Add a CNAME record pointing to `<username>.github.io`

3. In GitHub Settings → Pages, enter your custom domain

---

## Updating Your Site

After making changes to the web interface:

**Using the script:**
```bash
git add .
git commit -m "Update web interface"
git push
./deploy-gh-pages.sh
```

**Manual:**
```bash
# Make changes on your main branch
git add .
git commit -m "Update web interface"
git push

# Deploy to gh-pages
git checkout gh-pages
git checkout main -- index.html lexer.js parser.js generator.js
git commit -m "Update from main"
git push
git checkout main
```

---

## Recommended: Method 1

For most users, **Method 1 (gh-pages branch with script)** is recommended because:
- ✅ Keeps web files separate from source code
- ✅ Cleaner repository structure
- ✅ Easy to update with one command
- ✅ Standard GitHub Pages practice
