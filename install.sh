#!/usr/bin/env bash
# Install (or update) the SaaS playbook into a project.
# Usage: ./install.sh [--commit | --no-commit] [/path/to/project]   (default: the current folder)
#        npx github:subhash-arabhi/saas-playbook[#vX.Y.Z] [options] [/path/to/project]
# By default the playbook's files are gitignored and reinstalled from .agents/playbook.json.
# --commit keeps them in git instead. The choice is remembered on later updates.
set -euo pipefail

# Resolve symlinks (npx runs this through a link in node_modules/.bin).
SOURCE="${BASH_SOURCE[0]}"
while [[ -L "$SOURCE" ]]; do
  DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
  SOURCE="$(readlink "$SOURCE")"
  [[ "$SOURCE" != /* ]] && SOURCE="$DIR/$SOURCE"
done
SRC="$(cd -P "$(dirname "$SOURCE")" && pwd)"
REPO="github:subhash-arabhi/saas-playbook"
VERSION="$(sed -n 's/^ *"version": *"\([^"]*\)".*/\1/p' "$SRC/package.json" | head -1)"
MARK="# Written by the SaaS playbook installer."

# Options: [--commit | --no-commit] [/path/to/project]
MODE=""; DEST="."
for arg in "$@"; do
  case "$arg" in
    --commit) MODE="commit" ;;
    --no-commit) MODE="ignore" ;;
    -*) echo "Unknown option: $arg" >&2; exit 1 ;;
    *) DEST="$arg" ;;
  esac
done
if [[ ! -d "$DEST" ]]; then
  echo "Usage: install.sh [--commit | --no-commit] [/path/to/project]   (the folder must exist)" >&2
  exit 1
fi
DEST="$(cd "$DEST" && pwd)"
STATE="$DEST/.agents/playbook.json"

# Keep the previous mode unless an option says otherwise. Default: the playbook isn't committed.
if [[ -z "$MODE" ]]; then
  if [[ -f "$STATE" ]] && grep -q '"commit": true' "$STATE"; then MODE="commit"; else MODE="ignore"; fi
fi

# 1. Playbook files -> .agents/ (replaced on every run; don't edit them inside the project)
mkdir -p "$DEST/.agents/skills"
for dir in rules workflows reviewers references templates tools licenses; do
  rm -rf "$DEST/.agents/$dir"
  cp -R "$SRC/$dir" "$DEST/.agents/$dir"
done
cp "$SRC/LICENSE" "$DEST/.agents/LICENSE"
# Skills: remove the previous version's playbook skills, then copy the current ones.
# Project skills (any skill not listed in playbook.json) are never touched.
if [[ -f "$STATE" ]]; then
  sed -n '/"skills": \[/,/\]/p' "$STATE" | sed -n 's/^ *"\([a-z0-9-]*\)",*$/\1/p' | while read -r old; do
    rm -rf "$DEST/.agents/skills/$old"
  done
fi
SKILLS=()
for skill in "$SRC"/skills/*/; do
  name="$(basename "$skill")"
  SKILLS+=("$name")
  rm -rf "$DEST/.agents/skills/$name"
  cp -R "$skill" "$DEST/.agents/skills/$name"
done

# Record what the playbook owns, its version, and how to reinstall it.
{
  echo '{'
  echo "  \"source\": \"$REPO\","
  echo "  \"version\": \"$VERSION\","
  echo "  \"install\": \"npx $REPO#v$VERSION\","
  echo "  \"commit\": $([[ "$MODE" == commit ]] && echo true || echo false),"
  echo '  "skills": ['
  for i in "${!SKILLS[@]}"; do
    sep=","; [[ $i -eq $((${#SKILLS[@]} - 1)) ]] && sep=""
    echo "    \"${SKILLS[$i]}\"$sep"
  done
  echo '  ]'
  echo '}'
} > "$STATE"

# Keep the playbook out of git (unless --commit). Project skills stay committed.
GI="$DEST/.agents/.gitignore"
if [[ "$MODE" == ignore ]]; then
  {
    echo "$MARK Don't edit."
    echo "# The playbook is reinstalled from playbook.json, so it isn't committed."
    echo "# Skills not listed here are this project's own skills and are committed."
    for dir in rules workflows reviewers references templates tools licenses; do echo "/$dir/"; done
    echo "/LICENSE"
    for name in "${SKILLS[@]}"; do echo "/skills/$name/"; done
  } > "$GI"
  echo "✓ Playbook v$VERSION installed in .agents/ (not committed; see .agents/.gitignore)"
else
  if [[ -f "$GI" ]] && head -1 "$GI" | grep -qF "$MARK"; then rm "$GI"; fi
  echo "✓ Playbook v$VERSION installed in .agents/ (committed with the project)"
fi

# 2. AGENTS.md at the project root (never overwritten: it holds the project-specific section)
if [[ ! -f "$DEST/AGENTS.md" ]]; then
  cp "$SRC/AGENTS.md" "$DEST/AGENTS.md"
  echo "✓ AGENTS.md created. Fill in its 'Project-specific' section."
elif ! cmp -s "$SRC/AGENTS.md" "$DEST/AGENTS.md"; then
  cp "$SRC/AGENTS.md" "$DEST/AGENTS.playbook.md"
  echo "! AGENTS.md already exists. The latest playbook version is in AGENTS.playbook.md."
  echo "  Merge it into AGENTS.md (keep your 'Project-specific' section), then delete AGENTS.playbook.md."
fi

# 3. CLAUDE.md so Claude Code loads AGENTS.md (any version)
if [[ ! -f "$DEST/CLAUDE.md" ]]; then
  printf '@AGENTS.md\n' > "$DEST/CLAUDE.md"
  echo "✓ CLAUDE.md created (imports AGENTS.md for Claude Code)"
elif ! grep -q '^@AGENTS.md' "$DEST/CLAUDE.md"; then
  echo "! CLAUDE.md exists but doesn't import AGENTS.md. Add a first line: @AGENTS.md"
fi

# 4. Skills discovery: Cursor and Codex read .agents/skills natively; Claude Code reads .claude/skills
if [[ ! -e "$DEST/.claude/skills" ]]; then
  mkdir -p "$DEST/.claude"
  ln -s ../.agents/skills "$DEST/.claude/skills"
  echo "✓ .claude/skills -> .agents/skills (Claude Code skill discovery)"
elif [[ ! -L "$DEST/.claude/skills" ]]; then
  echo "! .claude/skills already exists as a folder. Claude Code will still find skills via AGENTS.md."
fi

# 5. Project folders the playbook expects
mkdir -p "$DEST/plans"
echo "✓ plans/ ready"

cat <<'EOF'

Done. Next:
  1. Fill in the 'Project-specific' section of AGENTS.md (product, cloud, project skills).
  2. Commit AGENTS.md, CLAUDE.md, .claude/skills, plans/ and .agents/ (git skips the playbook's own files
     unless you installed with --commit). If they were committed before, untrack them once:
       git rm -r --cached --quiet .agents && git add .agents
  3. Tell your agent: "Read AGENTS.md and follow it strictly."
  4. Optional, for Cursor/VS Code: bash .agents/tools/plan-editor/install.sh  (plans open as an editable plan view)
EOF
