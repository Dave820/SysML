#!/bin/bash

# Deploy to GitHub Pages
# This script creates/updates a gh-pages branch with the web interface files

set -e

echo "🚀 Deploying to GitHub Pages..."

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)

# Ensure we're on a clean state
if [[ -n $(git status -s) ]]; then
  echo "❌ Error: You have uncommitted changes. Please commit or stash them first."
  exit 1
fi

echo "📦 Creating deployment files..."

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "   Using temp directory: $TEMP_DIR"

# Copy necessary files to temp directory
cp index.html "$TEMP_DIR/"
cp lexer.js "$TEMP_DIR/"
cp parser.js "$TEMP_DIR/"
cp generator.js "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"
cp .nojekyll "$TEMP_DIR/"

# Create or switch to gh-pages branch
echo "🌿 Switching to gh-pages branch..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git checkout gh-pages
else
  git checkout --orphan gh-pages
  git rm -rf .
fi

# Copy files from temp directory
echo "📋 Copying files..."
cp -r "$TEMP_DIR"/* .

# Add and commit
git add .
git commit -m "Deploy to GitHub Pages" || echo "No changes to commit"

# Push to remote
echo "⬆️  Pushing to remote..."
git push -u origin gh-pages --force

# Switch back to original branch
git checkout "$CURRENT_BRANCH"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📌 Next steps:"
echo "   1. Go to your GitHub repository settings"
echo "   2. Navigate to Pages section"
echo "   3. Set Source to 'gh-pages' branch"
echo "   4. Your site will be available at: https://<username>.github.io/<repo-name>/"
echo ""
