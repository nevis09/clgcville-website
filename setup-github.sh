#!/bin/bash
# ─────────────────────────────────────────────────────────
# Church Of The Living God — GitHub Setup Script
# Run this once in Terminal to push your site to GitHub
# ─────────────────────────────────────────────────────────

set -e  # stop if any command fails

echo ""
echo "🚀 Setting up Church Of The Living God website on GitHub..."
echo ""

# Navigate to the project folder
cd "/Users/nevis09/Documents/Build Projects/Websites/clgcville-website"

# Step 1: Initialize git if not already done
if [ ! -d ".git" ]; then
  echo "→ Initializing git..."
  git init
  git branch -M main
else
  echo "→ Git already initialized."
fi

# Step 2: Stage all files
echo "→ Staging all files..."
git add .

# Step 3: Commit
echo "→ Creating initial commit..."
git commit -m "Initial commit — Church Of The Living God Charlottesville website" 2>/dev/null || echo "→ Already committed, skipping..."

# Step 4: Create the GitHub repo using gh CLI (if installed)
if command -v gh &> /dev/null; then
  echo "→ GitHub CLI found. Creating repo..."
  gh repo create clgcville-website \
    --public \
    --description "Church Of The Living God — Charlottesville website" \
    --source=. \
    --remote=origin \
    --push
  echo ""
  echo "✅ Done! Your site is now on GitHub."
  echo "   https://github.com/nevis09/clgcville-website"
else
  echo ""
  echo "⚠️  GitHub CLI (gh) not found. Doing it manually..."
  echo ""
  echo "→ Adding GitHub remote..."
  git remote remove origin 2>/dev/null || true
  git remote add origin https://github.com/nevis09/clgcville-website.git

  echo ""
  echo "─────────────────────────────────────────────────────────"
  echo "BEFORE RUNNING THE PUSH: You need to create the repo first."
  echo ""
  echo "1. Go to: https://github.com/new"
  echo "2. Repository name: clgcville-website"
  echo "3. Set to Public"
  echo "4. Click 'Create repository' (don't check any boxes)"
  echo "5. Come back to this terminal window and press ENTER"
  echo "─────────────────────────────────────────────────────────"
  read -p "Press ENTER when you've created the repo on GitHub..."

  echo "→ Pushing to GitHub..."
  git push -u origin main

  echo ""
  echo "✅ Done! Your site is now on GitHub."
  echo "   https://github.com/nevis09/clgcville-website"
fi
