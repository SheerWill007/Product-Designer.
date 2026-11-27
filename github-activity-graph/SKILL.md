---
name: github-activity-graph
description: A custom GitHub contribution heatmap for portfolios. It fetches a user's last year of contributions, lays them out as week columns with month labels, uses theme-aware colour levels, and adds hover tooltips, a total and a legend, with loading, error and mobile states. Use when adding a GitHub activity, contribution or commit graph, calendar or heatmap to a site, or when an existing one shows days on the wrong row, breaks in dark mode, shifts the layout while loading or overflows on phones.
---

# GitHub activity graph

willx.tech shows the last 365 days of contributions under the intro: small rounded cells in a blue-grey scale that inverts between themes, month labels above, and a tooltip ("3 contributions on March 4, 2026") on hover.

## Data source options

| Source | Notes |
| --- | --- |
| `https://github-contributions-api.jogruber.de/v4/<user>?y=last` | Public, no token, cached for 1h. Returns `{ total, contributions: [{ date, count, level 0–4 }] }`. Used by the reference |
| `react-github-calendar` package | Drop-in component built on the same API. Less control over markup |
| GitHub GraphQL `contributionsCollection` | Most accurate, includes private contributions if allowed. Needs a token, so fetch on the server (route handler or server component with `revalidate: 3600`) |

Use the API's `level` (0–4) instead of inventing thresholds. It already scales to the user's own activity.

## Layout rules

- Weeks are columns of 7 (Sunday at the top). Pad the start with empty cells for the first day's weekday, so every date lands on the right row.
- Parse dates as **local noon** (`new Date(y, m - 1, d, 12)`). Parsing `"2026-01-08"` as UTC can shift it to the previous day west of Greenwich.
- Show a month label above the first week of each month. Position it from the week index × (cell + gap).
- Cells are 11px with a 3px gap and `rounded-[2px]`. On hover they scale to 1.25 (not with reduced motion).
- **Colours** come only from CSS variables `--gh-0…4`, defined under `:root` and `.dark`. Light is blue-grey getting darker, dark is grey getting lighter. Never hard-code the palette in the component.
- **Mobile:** the grid has a fixed natural width inside `overflow-x-auto`, scrolled to the end (latest weeks) on load. Add `data-lenis-prevent` so sideways scrolling works with smooth scroll.

## States

- **Loading:** reserve the graph's height (7 rows + labels) and show a soft pulse, so nothing jumps.
- **Error:** a short line ("Couldn't load contributions right now"). Never a broken grid.
- **Loaded:** the total ("1,234 activities in the last year") and a Less → More legend.

## Accessibility

- The grid is one `role="img"` with an `aria-label` summary. The individual cells are `aria-hidden`, because 365 focus stops would be unusable.
- If the numbers matter, add a visually hidden table of monthly totals.
- The tooltip is decorative (hover only), and the summary carries the meaning.

## Theme tokens

```css
:root { --gh-0:#ebedf0; --gh-1:#c5cbe0; --gh-2:#9aa3c2; --gh-3:#6b7596; --gh-4:#3d4766; }
.dark { --gh-0:#232323; --gh-1:#4d5363; --gh-2:#747c92; --gh-3:#b0b8d0; --gh-4:#e3e8ff; }
```

For GitHub's own green, use `#ebedf0 #9be9a8 #40c463 #30a14e #216e39` (light) and `#161b22 #0e4429 #006d32 #26a641 #39d353` (dark).

## References

- `references/GitHubGraph.tsx`: the client component (username prop, `y=last`, levels, loading and error states, mobile scroll, tooltip, legend)
