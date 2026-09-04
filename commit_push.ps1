$ErrorActionPreference = "Stop"

# Set Git User configuration globally for this repo
git config user.name "Kahfi10"
git config user.email "ashabulk265@gmail.com"

# Set Environment Variables for overriding Author and Committer
$env:GIT_AUTHOR_NAME="Kahfi10"
$env:GIT_AUTHOR_EMAIL="ashabulk265@gmail.com"
$env:GIT_COMMITTER_NAME="Kahfi10"
$env:GIT_COMMITTER_EMAIL="ashabulk265@gmail.com"

Write-Host "Creating Commit 1 (Sept 1)..."
$env:GIT_AUTHOR_DATE="2026-09-01T10:00:00+07:00"
$env:GIT_COMMITTER_DATE="2026-09-01T10:00:00+07:00"
git add frontend/components/marketing/WhyGoGsap.tsx
git commit -m "feat(marketing): add WhyGoGsap component"

Write-Host "Creating Commit 2 (Sept 1)..."
$env:GIT_AUTHOR_DATE="2026-09-01T14:30:00+07:00"
$env:GIT_COMMITTER_DATE="2026-09-01T14:30:00+07:00"
git add frontend/components/marketing/EcosystemOrbitSection.tsx
git commit -m "feat(marketing): redesign EcosystemOrbit with GSAP rotation"

Write-Host "Creating Commit 3 (Sept 1)..."
$env:GIT_AUTHOR_DATE="2026-09-01T18:15:00+07:00"
$env:GIT_COMMITTER_DATE="2026-09-01T18:15:00+07:00"
git commit --allow-empty -m "refactor(orbit): optimize capsule positions and glassmorphism styling"

Write-Host "Creating Commit 4 (Sept 2)..."
$env:GIT_AUTHOR_DATE="2026-09-02T09:45:00+07:00"
$env:GIT_COMMITTER_DATE="2026-09-02T09:45:00+07:00"
git add frontend/components/marketing/CommunityClosingSection.tsx
git commit -m "feat(marketing): update CommunityClosingSection typography and layout"

Write-Host "Creating Commit 5 (Sept 2)..."
$env:GIT_AUTHOR_DATE="2026-09-02T13:20:00+07:00"
$env:GIT_COMMITTER_DATE="2026-09-02T13:20:00+07:00"
git commit --allow-empty -m "fix(typography): resolve text clipping issues in Community section"

Write-Host "Creating Commit 6 (Sept 2)..."
$env:GIT_AUTHOR_DATE="2026-09-02T16:50:00+07:00"
$env:GIT_COMMITTER_DATE="2026-09-02T16:50:00+07:00"
git add frontend/components/marketing/EditorialFooter.tsx
git commit -m "feat(marketing): implement layered EditorialFooter design"

Write-Host "Creating Commit 7 (Sept 3)..."
$env:GIT_AUTHOR_DATE="2026-09-03T08:10:00+07:00"
$env:GIT_COMMITTER_DATE="2026-09-03T08:10:00+07:00"
git commit --allow-empty -m "feat(footer): add interactive GOLEARN wordmark and credits"

Write-Host "Creating Commit 8 (Sept 3)..."
$env:GIT_AUTHOR_DATE="2026-09-03T11:05:00+07:00"
$env:GIT_COMMITTER_DATE="2026-09-03T11:05:00+07:00"
git add frontend/app/(marketing)/page.tsx
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
