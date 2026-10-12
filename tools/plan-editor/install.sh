#!/usr/bin/env bash
# Package and install the plan editor extension into Cursor and/or VS Code.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp "$DIR/../plan.mjs" "$DIR/plan-core.mjs"
cd "$DIR"
npx --yes @vscode/vsce@3.6.0 package --no-dependencies --allow-missing-repository --skip-license -o plan-editor.vsix >/dev/null
echo "✓ Packaged plan-editor.vsix"
installed=0
install_into() { # $1 = label, then candidate CLIs
  local label="$1"; shift
  for cli in "$@"; do
    if command -v "$cli" >/dev/null 2>&1 || [[ -x "$cli" ]]; then
      "$cli" --install-extension "$DIR/plan-editor.vsix" --force >/dev/null && echo "✓ Installed in $label" && installed=1
      return
    fi
  done
}
install_into Cursor cursor "/Applications/Cursor.app/Contents/Resources/app/bin/cursor"
install_into "VS Code" code "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
[[ $installed == 1 ]] || echo "! No Cursor or VS Code CLI found. Install plan-editor.vsix manually: Extensions → … → Install from VSIX."
echo "Open any plans/*.md file to see the plan view (reload the window if it was already open)."
