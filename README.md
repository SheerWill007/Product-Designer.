# Product-Designer.

My collection of design skills.

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
