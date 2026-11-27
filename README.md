# Product-Designer.

My collection of design skills.

## Skills

**Style and direction**

| Skill | What it's for |
| --- | --- |
| [willx-design-system](willx-design-system/SKILL.md) | The willx.tech look: monospace type, black-first tokens, opacity text scale, layout, patterns, voice |
| [design-direction](design-direction/SKILL.md) | Setting a distinctive direction for a new project before building |
| [ui-polish-review](ui-polish-review/SKILL.md) | Reviewing UI for accessibility and polish, with file:line findings |
| [component-recreation](component-recreation/SKILL.md) | Turning a reference image ("I want this") into a matching, working component |
| [mobile-polish](mobile-polish/SKILL.md) | Making interactive desktop-first pages work well on phones |

**Motion and interaction**

| Skill | What it's for |
| --- | --- |
| [web-motion](web-motion/SKILL.md) | Scroll reveals, stagger, typewriter, Lenis smooth scroll, reduced motion |
| [theme-toggle-reveal](theme-toggle-reveal/SKILL.md) | Dark/light toggle with a circular View Transitions reveal |
| [custom-cursor](custom-cursor/SKILL.md) | The inverting arrow cursor (mix-blend-mode difference) |

**Components from willx.tech**

| Skill | What it's for |
| --- | --- |
| [skeuomorphic-controls](skeuomorphic-controls/SKILL.md) | Hardware-style dial, level bar and folding control panel |
| [ambient-music-player](ambient-music-player/SKILL.md) | Site music: shared player, record-player widget, iPhone volume fix |
| [canvas-crowd-footer](canvas-crowd-footer/SKILL.md) | The walking-crowd footer scene and its sprite pipeline |
| [booking-contact-section](booking-contact-section/SKILL.md) | "Let's talk" section with cal.com link, popup or inline booking |
| [github-activity-graph](github-activity-graph/SKILL.md) | Theme-aware GitHub contribution heatmap |
| [project-showcase](project-showcase/SKILL.md) | Project data, featured cards, archive cards and case studies |

`_components/` holds standalone HTML demos (open them directly in a browser).

## Structure

```
Design Skills/
  _template/          starting point for new skills (not installed)
  <skill-name>/
    SKILL.md          frontmatter (name, description) + instructions
    references/       optional supporting docs
    scripts/          optional helper scripts
    assets/           optional templates, palettes, examples
  link-skills.ps1     installs every skill into ~/.claude/skills
```

## Adding a skill

1. Copy `_template` to a new folder named after the skill (lowercase, hyphens).
2. Set `name` in the frontmatter to the folder name and write the `description`.
3. Write the instructions.
4. Run `./link-skills.ps1`.

## Installing

`link-skills.ps1` creates a junction in `~/.claude/skills` for every skill folder here, so edits in this folder take effect immediately. Folders starting with `_` or `.` are skipped. Re-run it after adding or renaming a skill; run it with `-Clean` to also remove links to skills that no longer exist here.
