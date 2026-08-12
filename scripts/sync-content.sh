#!/bin/sh
# Copy the guide's markdown from the source repository into this site.
#
# The site vendors the prose rather than building from a checkout of the guide,
# so that `pnpm dev` and `pnpm build` work standalone. The cost is that the copy
# goes stale: run this after the guide changes, then commit the result.
#
# Usage:
#   ./scripts/sync-content.sh [path-to-organizational-development]
#
# The default path assumes the two repositories are siblings:
#   organizational-development/
#   ├── organizational-development/            <- the guide
#   └── organizational-development.github.io/  <- this site

set -eu

here=$(cd "$(dirname "$0")/.." && pwd)
source_repo=${1:-"$here/../organizational-development"}

if [ ! -d "$source_repo/topics" ]; then
    echo "No topics/ directory under $source_repo" >&2
    echo "Pass the path to the guide repository as the first argument." >&2
    exit 1
fi

destination="$here/src/content"

# Remove first so a topic deleted upstream is deleted here too, rather than
# lingering as an orphaned page that the contents still links to.
rm -rf "$destination/topics"
mkdir -p "$destination/topics"

# Each topic is a directory holding `index.md` plus a `README.md` symlink to it.
# Flatten to `<slug>.md` here: the site routes on the slug, and copying the
# symlink would duplicate every topic.
for dir in "$source_repo"/topics/*/; do
    slug=$(basename "$dir")
    [ -f "$dir/index.md" ] || { echo "No index.md in $dir" >&2; exit 1; }
    cp "$dir/index.md" "$destination/topics/$slug.md"
done

cp "$source_repo/README.md" "$destination/README.md"

count=$(find "$destination/topics" -name '*.md' | wc -l | tr -d ' ')
echo "Synced the guide and $count topics from $source_repo"
echo "Review with: git -C \"$here\" status"
