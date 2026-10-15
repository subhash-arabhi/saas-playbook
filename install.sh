#!/usr/bin/env bash
# Install (or update) the SaaS playbook into a project.
# Usage: ./install.sh [--commit | --no-commit] [--force] [/path/to/project]   (default: the current folder)
#        npx github:subhash-arabhi/saas-playbook[#vX.Y.Z] [options] [/path/to/project]
# By default the playbook's files are gitignored and reinstalled from .agents/playbook.json.
# --commit keeps them in git instead. The choice is remembered on later updates.
# Updates delete only files the playbook installed; locally edited ones are backed up to .agents/.backup/.
# --force installs over .agents/ content the playbook didn't install, after backing it up.
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

# Options: [--commit | --no-commit] [--force] [/path/to/project]
MODE=""; DEST="."; FORCE=""
for arg in "$@"; do
  case "$arg" in
    --commit) MODE="commit" ;;
    --no-commit) MODE="ignore" ;;
    --force) FORCE=1 ;;
    -*) echo "Unknown option: $arg" >&2; exit 1 ;;
    *) DEST="$arg" ;;
  esac
done
if [[ ! -d "$DEST" ]]; then
  echo "Usage: install.sh [--commit | --no-commit] [--force] [/path/to/project]   (the folder must exist)" >&2
  exit 1
fi
DEST="$(cd "$DEST" && pwd)"
AG="$DEST/.agents"
STATE="$AG/playbook.json"
DIRS="rules workflows reviewers references templates tools licenses"

if command -v sha256sum >/dev/null 2>&1; then SHA=(sha256sum)
elif command -v shasum >/dev/null 2>&1; then SHA=(shasum -a 256)
else echo "The installer needs sha256sum or shasum." >&2; exit 1; fi
# Paths (relative to .agents/) on stdin -> "<sha256> <path>" lines for those that exist.
hashes() { (cd "$AG" && while read -r rel; do [[ -f "$rel" ]] && printf '%s\0' "$rel"; done | xargs -0 -r "${SHA[@]}" | sed 's/^\([0-9a-f]*\) [ *]/\1 /') || true; }

# Keep the previous mode unless an option says otherwise. Default: the playbook isn't committed.
if [[ -z "$MODE" ]]; then
  if [[ -f "$STATE" ]] && grep -q '"commit": true' "$STATE"; then MODE="commit"; else MODE="ignore"; fi
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
# What the previous install owns: its skills, and its files as "<sha256> <path>" (relative to .agents/).
: > "$TMP/old-skills"; : > "$TMP/old-files"
if [[ -f "$STATE" ]]; then
  sed -n '/"skills": \[/,/\]/p' "$STATE" | sed -n 's/^ *"\([a-z0-9-]*\)",*$/\1/p' > "$TMP/old-skills"
  sed -n '/"files": {/,/}/p' "$STATE" | sed -n 's/^ *"\([^"]*\)": "\([0-9a-f]\{64\}\)",*$/\2 \1/p' > "$TMP/old-files"
fi
# What this version installs (relative to the playbook source and to .agents/).
SKILLS=()
for skill in "$SRC"/skills/*/; do SKILLS+=("$(basename "$skill")"); done
# shellcheck disable=SC2086 # DIRS is a fixed list of folder names
(cd "$SRC" && { echo LICENSE; find $DIRS skills -type f ! -name .DS_Store; } | LC_ALL=C sort) > "$TMP/new-files"

# Stop before changing anything if .agents/ holds content the playbook didn't install.
UNMANAGED=(); COLLIDING=()
if [[ ! -f "$STATE" ]]; then
  for dir in $DIRS; do [[ -e "$AG/$dir" ]] && UNMANAGED+=(".agents/$dir"); done
fi
for name in "${SKILLS[@]}"; do
  if [[ -e "$AG/skills/$name" ]] && ! grep -qxF "$name" "$TMP/old-skills"; then COLLIDING+=("$name"); fi
done
if [[ ${#UNMANAGED[@]} -gt 0 || ${#COLLIDING[@]} -gt 0 ]] && [[ -z "$FORCE" ]]; then
  {
    [[ ${#UNMANAGED[@]} -gt 0 ]] && echo "✗ .agents/ already has folders the playbook didn't install (no .agents/playbook.json): ${UNMANAGED[*]}"
    [[ ${#COLLIDING[@]} -gt 0 ]] && echo "✗ These project skills have the same name as a playbook skill: ${COLLIDING[*]} (in .agents/skills/)"
    echo "  Nothing was changed. Rename or move them, or run again with --force to back them up to .agents/.backup/ and install over them."
  } >&2
  exit 1
fi

BACKUP="$AG/.backup/$(date +%Y%m%d-%H%M%S)"
BACKED=0
backup() { # <path relative to .agents/>
  mkdir -p "$(dirname "$BACKUP/$1")"
  cp -R "$AG/$1" "$BACKUP/$1"
  BACKED=$((BACKED + 1))
}

# 1. Playbook files -> .agents/ (replaced on every run; don't edit them inside the project)
for path in "${UNMANAGED[@]+"${UNMANAGED[@]}"}"; do rel="${path#.agents/}"; backup "$rel"; rm -rf "${AG:?}/$rel"; done
for name in "${COLLIDING[@]+"${COLLIDING[@]}"}"; do backup "skills/$name"; rm -rf "${AG:?}/skills/$name"; done
# Delete the previous version's files. Back up any that were edited since they were installed.
if [[ -s "$TMP/old-files" ]]; then
  cut -d' ' -f2- "$TMP/old-files" | hashes > "$TMP/current"
  grep -vxFf "$TMP/old-files" "$TMP/current" > "$TMP/edited" || true
  while read -r _ rel; do backup "$rel"; done < "$TMP/edited"
  cut -d' ' -f2- "$TMP/current" | (cd "$AG" && tr '\n' '\0' | xargs -0 rm -f)
elif [[ -f "$STATE" ]]; then
  # Installed before files were recorded (v1.0.x): back up any that differ from this version.
  # shellcheck disable=SC2086
  (cd "$AG" && { [[ -f LICENSE ]] && echo LICENSE; for d in $DIRS; do [[ -d "$d" ]] && find "$d" -type f; done
    while read -r s; do [[ -d "skills/$s" ]] && find "skills/$s" -type f; done < "$TMP/old-skills"; } || true) > "$TMP/legacy-files"
  while read -r rel; do
    cmp -s "$AG/$rel" "$SRC/$rel" || backup "$rel"
  done < "$TMP/legacy-files"
  (cd "$AG" && tr '\n' '\0' < "$TMP/legacy-files" | xargs -0 rm -f)
fi
# shellcheck disable=SC2086
for dir in $DIRS $(sed 's|^|skills/|' "$TMP/old-skills"); do
  [[ -d "$AG/$dir" ]] && find "$AG/$dir" -depth -type d -empty -delete
done
# Copy this version. Project skills (any skill not listed in playbook.json) are never touched.
while read -r rel; do
  [[ -e "$AG/$rel" ]] && backup "$rel"
done < "$TMP/new-files"
mkdir -p "$AG"
(cd "$SRC" && COPYFILE_DISABLE=1 tar -cf - -T "$TMP/new-files") | (cd "$AG" && tar -xf -)
if [[ $BACKED -gt 0 ]]; then
  echo "! Backed up $BACKED locally changed or unmanaged file(s) to ${BACKUP#"$DEST/"}/ before replacing them."
  echo "  Compare with: diff -r ${BACKUP#"$DEST/"} .agents   (delete the backup when you're done)"
fi

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
  echo '  ],'
  echo '  "files": {'
  hashes < "$TMP/new-files" | sed 's/^\([0-9a-f]*\) \(.*\)$/    "\2": "\1",/; $s/,$//'
  echo '  }'
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
    echo "/.backup/"
  } > "$GI"
  echo "✓ Playbook v$VERSION installed in .agents/ (not committed; see .agents/.gitignore)"
else
  if [[ -f "$GI" ]] && head -1 "$GI" | grep -qF "$MARK"; then rm "$GI"; fi
  echo "✓ Playbook v$VERSION installed in .agents/ (committed with the project)"
fi

# 2. AGENTS.md at the project root (never overwritten: it holds the project-specific section)
TEMPLATE="$SRC/templates/project-AGENTS.md"
if [[ ! -f "$DEST/AGENTS.md" ]]; then
  cp "$TEMPLATE" "$DEST/AGENTS.md"
  echo "✓ AGENTS.md created. Fill in its 'Project-specific' section."
elif ! cmp -s "$TEMPLATE" "$DEST/AGENTS.md"; then
  cp "$TEMPLATE" "$DEST/AGENTS.playbook.md"
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

# 5. Hooks that show a plan in the plan view whenever the agent changes it (Cursor and Claude Code)
node "$SRC/tools/install-hooks.mjs" "$DEST"

# 6. Project folders the playbook expects
mkdir -p "$DEST/plans"
echo "✓ plans/ ready"

cat <<'EOF'

Done. Next:
  1. Fill in the 'Project-specific' section of AGENTS.md (product, cloud, project skills).
  2. Commit AGENTS.md, CLAUDE.md, .claude/, .cursor/hooks.json, plans/ and .agents/ (git skips the playbook's own files
     unless you installed with --commit). If they were committed before, untrack them once:
       git rm -r --cached --quiet .agents && git add .agents
  3. Tell your agent: "Read AGENTS.md and follow it strictly."
  4. Optional, for Cursor/VS Code: bash .agents/tools/plan-editor/install.sh  (plans open as an editable plan view)
EOF
