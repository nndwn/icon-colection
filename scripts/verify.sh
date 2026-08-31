#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

echo "Installing dependencies..."
npm install

echo "Updating README icons..."
npm run update:icons

echo "Checking TypeScript..."
npx tsc --noEmit

echo "Checking git diff..."
git diff --check

echo "All checks passed."
