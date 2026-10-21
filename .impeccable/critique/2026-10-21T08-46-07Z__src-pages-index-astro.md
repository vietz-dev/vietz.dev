---
target: personal website
total_score: 18
max_score: 24
na_heuristics: 5,7,9,10
p0_count: 0
p1_count: 3
target_identity: "file:/Users/justinv/orca/workspaces/vietz.dev/arapaima/src/pages/index.astro"
target_fingerprint: "sha256:fc2a95b7cdcb773c7ea852e4558394f961d00d2238ee451e46c5846caefb8a4a"
target_path: /Users/justinv/orca/workspaces/vietz.dev/arapaima/src/pages/index.astro
timestamp: 2026-10-21T08-46-07Z
slug: src-pages-index-astro
---
# Impeccable critique: vietz.dev

Method: dual-agent (A: design_review · B: detector_review)

## Design health

| # | Nielsen heuristic | Score | Key observation |
|---|---|---:|---|
| 1 | Visibility of system status | 3/4 | Active navigation and menu state are clear. |
| 2 | Match with the real world | 3/4 | Most copy is plain; some technical language needs proof or explanation. |
| 3 | User control and freedom | 3/4 | Navigation and theme work; the project card does not signal its external destination. |
| 4 | Consistency and standards | 4/4 | Pages share typography, cards, spacing, and navigation. |
| 5 | Error prevention | n/a | No input or destructive task. |
| 6 | Recognition rather than recall | 3/4 | Navigation is clear, but email is only on the CV page. |
| 7 | Flexibility and efficiency | n/a | No repeated task on this portfolio. |
| 8 | Aesthetic and minimalist design | 2/4 | Strong restraint, but the greeting leads before identity and the CV skills are dense. |
| 9 | Error recovery | n/a | No recoverable input flow. |
| 10 | Help and documentation | n/a | No task requiring help content. |
| **Total** | | **18/24 (Good)** | Six applicable heuristics. |

## Design specificity

The dictionary-style “Moin” opening, its Bremen reference, and the mono/sans/serif mix feel personal to Justin. The rest of the site is more interchangeable: one generic project card, one blog card, and a standard CV timeline. The clearest opportunity is to connect that distinctive introduction to concrete work and a visible next step.

The source detector found 0 issues in `src/pages`. A full `src` scan found one `side-tab` warning at `src/styles/global.css:295`; it is a false positive on a blockquote border. In rendered scans, the detector reported 7 findings on home, 3 on projects, 4 on blog, and 12 on CV. The repeated actionable finding is `low-contrast`: faint text is about 3.0–3.1:1 on light backgrounds. Other findings were `line-length` on home, `straggler` on blog, and `wide-tracking` on CV. `cream-palette` flags the intentional warm palette and is a taste warning, not a defect.

The rendered detector ran in isolated headless Chrome after the shared Playwright profile was unavailable. Injection and overlay DOM worked, with no page console errors, but there is no reliable user-visible overlay tab.

## Overall impression

The site feels thoughtful and coherent. It makes a memorable first impression, then asks visitors to search for the evidence and contact route that should support that impression.

## What works

- “Moin” gives the homepage a specific voice and story.
- The warm palette, type choices, and shared card system make the pages feel related.
- The CV presents experience in a readable chronology and exposes an email address.

## Priority issues

1. **P1 — CV download is broken.** `src/pages/cv.astro:91` links to `/CV_EN.pdf`, which returns 404; no PDF exists in `public/`. A visitor following the most explicit CV action reaches a dead end. Add the actual PDF or remove the download action until it exists. Suggested command: `$impeccable harden`.
2. **P1 — The first mobile screen hides Justin’s identity and next step.** At 390 px, the “Moin” block fills roughly y121–414; Justin’s name starts around y519 and project links around y877. Keep the device, but put name, role, and a clear next step above or beside it. `src/pages/index.astro:13` and `src/components/Moin.astro:1`. Suggested command: `$impeccable layout`.
3. **P1 — The project page gives too little evidence.** Its only entry describes WorkTime in one generic sentence and sends visitors to another site. It does not explain the problem, Justin’s contribution, or what the work demonstrates. Add a compact case study using only facts Justin confirms. `src/pages/projects.astro:5`. Suggested command: `$impeccable clarify`.
4. **P2 — Contact is hard to discover.** Email appears on the CV page, while home, projects, and blog offer no direct contact action. A recruiter must guess where to find it. Add a visible contact path on home and/or in shared navigation or footer. `src/pages/cv.astro:88`, `src/components/Footer.astro:11`. Suggested command: `$impeccable clarify`.
5. **P2 — Faint light-theme text is too hard to read.** The detector measures repeated labels and metadata around 3.0–3.1:1; the shared `--fg-faint` token drives many of them. Raise its contrast and recheck both themes. `src/styles/global.css:28`. Suggested command: `$impeccable audit`.

## Cognitive load and visitor paths

Two of eight checks fail: the first-screen hierarchy puts the decorative definition before identity, and visitors must remember the homepage pitch while switching to projects and CV for proof and email. No navigation decision presents more than four options. The CV’s 35-plus skill tags are a separate scanning burden.

The emotional path begins with a warm, distinctive greeting, then loses momentum at the thin project entry, and recovers on the CV when the timeline and email appear. The PDF error breaks that recovery.

For a first-time visitor, the opening does not answer who Justin is within the first mobile screen. A mobile visitor scrolls past the greeting and uses a 28×28 px menu control (`src/components/Navbar.astro:193`). A visitor checking claims finds little context on the project card and is sent to a new tab without a clear external-link label (`src/components/ListItem.astro:39`).

## Smaller observations

- The home quick facts repeat location and focus already stated in the introduction (`src/pages/index.astro:5`).
- The CV skill wall pushes education farther down (`src/pages/cv.astro:45`).
- The blog has one post; its list treatment is consistent but does little to show the range of Justin’s writing.

## Questions to consider

- What can a recruiter verify about Justin’s work in 30 seconds without leaving this site?
- Can “Moin” frame the first sentence while the name and role remain visible immediately?
- Which skills have work samples that can substantiate them?
