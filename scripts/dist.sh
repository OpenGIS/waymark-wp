#!/usr/bin/env bash
#
# Build a CI-faithful distributable plugin zip.
#
# Copies tracked files into a temporary staging tree, runs the release build
# there, applies .distignore with the same rsync semantics as the 10up deploy
# action, and writes .opencode/tmp/waymark-<version>.zip. The working tree is
# never modified.

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

TMP_DIR="$ROOT/.opencode/tmp"
VERSION=$(grep -m1 '^Version:' "$ROOT/Waymark.php" | awk '{print $NF}')

if [ -z "$VERSION" ]; then
	echo "ERROR: could not read the Version header from Waymark.php" >&2
	exit 1
fi

for cmd in git rsync zip unzip; do
	if ! command -v "$cmd" >/dev/null 2>&1; then
		echo "ERROR: '$cmd' is required but was not found in PATH" >&2
		exit 1
	fi
done

if [ ! -x "$ROOT/node_modules/.bin/grunt" ]; then
	echo "ERROR: grunt not found. Run 'npm ci' (or 'npm install') first." >&2
	exit 1
fi

if ! git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
	echo "ERROR: $ROOT is not a git working tree; cannot determine tracked files" >&2
	exit 1
fi

mkdir -p "$TMP_DIR"

WORK_DIR=$(mktemp -d "$TMP_DIR/dist.XXXXXX")
STAGE="$WORK_DIR/stage"
DIST="$WORK_DIR/dist"
ZIP="$TMP_DIR/waymark-$VERSION.zip"

cleanup() {
	rm -rf -- "$WORK_DIR"
}
trap cleanup EXIT

mkdir -p "$STAGE" "$DIST/waymark"

echo "Staging tracked files..."
while IFS= read -r -d '' file; do
	mkdir -p "$STAGE/$(dirname "$file")"
	cp -pP "$ROOT/$file" "$STAGE/$file"
done < <(git -C "$ROOT" ls-files -z)

ln -s "$ROOT/node_modules" "$STAGE/node_modules"

echo "Running release build in staging tree..."
(
	cd "$STAGE"
	"$ROOT/node_modules/.bin/grunt" sync_version build
)

echo "Applying .distignore..."
rsync -rc --exclude-from="$STAGE/.distignore" "$STAGE/" "$DIST/waymark/" --delete --delete-excluded

echo "Verifying distributable..."
FORBIDDEN='(^|/)\.md$|(^|/)waymark-icon-template\.psd$|(^|/)tests(/|$)|(^|/)help(/|$)|(^|/)docs(/|$)|(^|/)\.opencode(/|$)|(^|/)scripts(/|$)|(^|/)\.distignore$'

DIST_VERSION=$(sed -n 's/^Version:[[:space:]]*//p' "$DIST/waymark/Waymark.php" | head -1 | tr -d '[:space:]')
if [ "$DIST_VERSION" != "$VERSION" ]; then
	echo "ERROR: waymark/Waymark.php version '$DIST_VERSION' does not match '$VERSION'" >&2
	exit 1
fi

DIST_STABLE=$(sed -n 's/^Stable tag:[[:space:]]*//p' "$DIST/waymark/readme.txt" | head -1 | tr -d '[:space:]')
if [ "$DIST_STABLE" != "$VERSION" ]; then
	echo "ERROR: waymark/readme.txt Stable tag '$DIST_STABLE' does not match '$VERSION'" >&2
	exit 1
fi

POT="$DIST/waymark/languages/waymark.pot"
if ! grep -Fq 'Report-Msgid-Bugs-To: https://wordpress.org/support/plugin/waymark\n"' "$POT"; then
	echo "ERROR: waymark/languages/waymark.pot has the wrong bug report URL" >&2
	exit 1
fi

if ! grep -Fq "\"Project-Id-Version: Waymark $VERSION\\n\"" "$POT"; then
	echo "ERROR: waymark/languages/waymark.pot is not at version $VERSION" >&2
	exit 1
fi

rm -f "$ZIP"
(
	cd "$DIST"
	zip -r -X "$ZIP" waymark >/dev/null
)

if unzip -Z1 "$ZIP" | grep -Eq "$FORBIDDEN"; then
	echo "ERROR: distributable contains development-only files:" >&2
	unzip -Z1 "$ZIP" | grep -E "$FORBIDDEN" >&2
	exit 1
fi

FILE_COUNT=$(unzip -Z1 "$ZIP" | grep -vc '/$' || true)
BYTES=$(wc -c <"$ZIP" | tr -d ' ')
if command -v shasum >/dev/null 2>&1; then
	SHA=$(shasum -a 256 "$ZIP" | awk '{print $1}')
else
	SHA=$(sha256sum "$ZIP" | awk '{print $1}')
fi

echo
echo "Zip:        $ZIP"
echo "Version:    $VERSION"
echo "Files:      $FILE_COUNT"
echo "Size:       $BYTES bytes"
echo "SHA-256:    $SHA"
echo
echo "Top-level manifest:"
unzip -Z1 "$ZIP" | grep -v '/$' | awk -F/ 'NF > 1 { print $1 "/" $2 }' | sort | uniq -c | awk '{ printf "  %5d  %s\n", $1, $2 }'
