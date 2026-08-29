# Browser Acceptance Checklist

Environment / URL:
- Local dev: `http://localhost:3006`
- Primary path family:
  - `/`
  - `/modules`
  - `/modules/[topic]`
  - `/modules/[topic]/[lesson]`
  - `/playground`
  - `/dashboard`
  - `/leaderboard`
  - `/profile/[username]`
  - `/settings`
  - `/login`
  - `/register`

Browsers:
- Chrome (latest stable on Windows)
- Edge (latest stable on Windows)

Target desktop viewports:
- `1280 x 720`
- `1366 x 768`
- `1440 x 900`
- Ultrawide smoke test: `1728 x 972` or wider equivalent

## Global Checks

- Page loads without fatal runtime errors
- No hydration warnings
- No unintended horizontal overflow
- Navbar stays reachable and aligned
- Text does not clip, collide, or collapse into narrow columns
- Primary CTA remains visible without awkward dead space
- Scrollbars do not hide required controls
- Font rendering remains readable in Chrome and Edge

## Landing Page `/`

- Hero stays balanced before split layout activates
- Left and right hero columns do not become compressed at `1280`/`1366`
- Hero animation does not leave content faded or invisible
- Topic cards and feature sections do not overflow horizontally

## Modules Catalog `/modules`

- Hero stats remain aligned across `1280`/`1366`/`1440`
- Topic cards keep title, badge, bookmark, and metadata readable
- Search bar and level filters remain usable on one or two rows as needed
- Recently viewed chips wrap cleanly

## Topic Page `/modules/[topic]`

- Summary card does not crowd the topic intro around `1280-1440`
- Lesson list badges show `Belum Lulus`, `Lulus`, `Sempurna` cleanly
- Locked lessons clearly explain why they are locked
- No card content jumps when line count changes

## Lesson Page `/modules/[topic]/[lesson]`

- Chrome and Edge render the left lesson column at comfortable width
- Desktop split mode only activates when there is enough room
- Lesson hero intro and reading-progress card do not become cramped
- Editor panel remains visible with Run button reachable
- Result/quiz/completion cards do not push controls off-screen
- First lesson bottom navigation aligns correctly when there is no previous lesson
- Sidebar lock states and labels remain readable
- Floating action bar appears only on stacked/mobile/tablet layout
- No overlap between top sub-navbar actions and content

## Playground `/playground`

- Hero control card does not squeeze intro copy at `1280-1440`
- Editor height remains practical on smaller laptops and ultrawide
- Template dropdown opens without clipping or overflow

## Dashboard `/dashboard`

- Hero right summary panel does not force left copy too narrow
- Stats cards wrap consistently across desktop widths
- Chart and side cards remain visible without excessive dead space
- Continue/recent activity cards keep alignment and readable spacing

## Leaderboard `/leaderboard`

- Hero summary stack remains visually balanced at `1280-1440`
- Spotlight/podium layout does not strand single-user content
- Ranking rows keep all columns reachable and readable
- Guest CTA does not create oversized voids on ultrawide

## Profile `/profile/[username]`

- Hero summary card does not compress profile name/details too early
- Stats grid remains readable at `1280` and `1366`
- Badge grid wraps without truncating labels

## Settings `/settings`

- Sidebar tabs remain readable and aligned before two-column layout starts
- Form fields, buttons, and validation messages stay reachable
- Long labels do not collide with inputs or cards

## Auth Pages `/login` and `/register`

- Two-panel auth layout only splits when there is sufficient width
- Benefits list remains readable and not overly stretched
- Form panel stays visually dominant and reachable

## Acceptance Report Template

```text
Acceptance scope:
Environment / URL:
Viewports / browsers:
Paths exercised:
Passed:
Repaired:
Remaining issues:
Evidence:
```
