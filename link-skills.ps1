# Links every skill folder in this repo into ~/.claude/skills using directory junctions.
# Usage:  ./link-skills.ps1          link new skills
#         ./link-skills.ps1 -Clean   also remove links whose skill folder no longer exists here

param([switch]$Clean)

$repo = $PSScriptRoot
$target = Join-Path $HOME '.claude\skills'
if (-not (Test-Path $target)) { New-Item -ItemType Directory -Force $target | Out-Null }

foreach ($dir in Get-ChildItem -Path $repo -Directory) {
    if ($dir.Name -like '_*' -or $dir.Name -like '.*') { continue }
    if (-not (Test-Path (Join-Path $dir.FullName 'SKILL.md'))) {
        Write-Host "skip   $($dir.Name) (no SKILL.md)"
        continue
    }

    $link = Join-Path $target $dir.Name
    if (Test-Path $link) {
        $item = Get-Item $link -Force
        if ($item.LinkType -eq 'Junction' -and $item.Target -contains $dir.FullName) {
            Write-Host "ok     $($dir.Name)"
        } else {
            Write-Warning "$($dir.Name): ~/.claude/skills already has a different '$($dir.Name)', left untouched"
        }
        continue
    }

    New-Item -ItemType Junction -Path $link -Target $dir.FullName | Out-Null
    Write-Host "linked $($dir.Name)"
}

if ($Clean) {
    foreach ($item in Get-ChildItem -Path $target -Directory -Force) {
        if ($item.LinkType -ne 'Junction') { continue }
        $dest = @($item.Target)[0]
        if ($dest -and $dest.StartsWith($repo, [StringComparison]::OrdinalIgnoreCase) -and -not (Test-Path $dest)) {
            # Removes only the junction itself, never a skill's files.
            [System.IO.Directory]::Delete($item.FullName)
            Write-Host "removed stale link $($item.Name)"
        }
    }
}
