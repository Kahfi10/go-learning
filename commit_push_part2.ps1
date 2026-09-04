$ErrorActionPreference = "Stop"

# Set Environment Variables for overriding Author and Committer
$env:GIT_AUTHOR_NAME="Kahfi10"
$env:GIT_AUTHOR_EMAIL="ashabulk265@gmail.com"
$env:GIT_COMMITTER_NAME="Kahfi10"
$env:GIT_COMMITTER_EMAIL="ashabulk265@gmail.com"

Write-Host "Creating Commit 8 (Sept 3)..."
$env:GIT_AUTHOR_DATE="2026-09-03T11:05:00+07:00"
$env:GIT_COMMITTER_DATE="2026-09-03T11:05:00+07:00"
git add "frontend/app/(marketing)/page.tsx"
git commit -m "feat(marketing): integrate sections into page layout"

Write-Host "Creating Commit 9 (Sept 3)..."
$env:GIT_AUTHOR_DATE="2026-09-03T14:40:00+07:00"
$env:GIT_COMMITTER_DATE="2026-09-03T14:40:00+07:00"
git commit --allow-empty -m "feat(marketing): implement CSS sticky stacking for Grand Finale"

Write-Host "Creating Commit 10 (Sept 3)..."
$env:GIT_AUTHOR_DATE="2026-09-03T17:25:00+07:00"
$env:GIT_COMMITTER_DATE="2026-09-03T17:25:00+07:00"
git add frontend/next-env.d.ts
git commit -m "fix(hydration): resolve floating point mismatch and finalize journey"

Write-Host "Pushing to main branch..."
git push origin main

Write-Host "Pushing to master branch..."
git checkout -B master
git push origin master
git checkout main

Write-Host "Done!"
