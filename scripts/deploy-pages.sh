#!/bin/bash
# Build s cestou GitHub Pages a push do větve gh-pages (Pages zdroj: gh-pages / root).
# Pozor: každé spuštění = zveřejnění nové verze náhledu.
set -e
cd "$(dirname "$0")/.."
BASE_PATH=/rezidence-slovanske-udoli/ node src/build.mjs
REMOTE=$(git remote get-url origin)
cd dist
touch .nojekyll
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git push -q -f "$REMOTE" gh-pages
rm -rf .git
echo "Nasazeno: https://grafika-imptest.github.io/rezidence-slovanske-udoli/"
