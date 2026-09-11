#!/bin/sh
# ─── deploy-drift-onbox.sh — the ON-BOX half of the L10 deploy-drift signal ──────
#
# Runs ON the VPS (needs docker + curl, nothing else). For every MCOS container:
#   state      docker's view: running / restarting / exited …
#   health     the compose healthcheck: healthy / unhealthy / starting / none
#   running    the digest the container's image was pulled by (RepoDigests)
#   published  the digest GHCR holds for :latest right now
#   verdict    OK · BEHIND (published != running) · RESTARTING · UNHEALTHY · EXITED · NOT FOUND
#
# This is the half the outside checker (scripts/deploy-drift.mjs) cannot do: only
# the box knows a container's real state and which digest it is actually running.
# Together they answer "is production the code I think it is, and is it alive?"
#
# Usage (from /root/Mechanical-Cupcakes-OS-Shell):
#   sh scripts/deploy-drift-onbox.sh
# Exit codes:  0 all OK · 1 at least one BEHIND · 2 at least one not running/unhealthy
#
# Single, short commands only — this file exists so the drift check is ONE line to
# paste into the VPS terminal, which mangles anything compound. When the back
# office moves onto the box, this is what its cron runs.

set -u
CONTAINERS="mcos-shell mcos-ochi mcos-pennypost ochi-postgres ochi-metabase"
GHCR_OWNER="ernestofgaia"
worst=0

ghcr_digest() {
  # $1 = image name without owner, e.g. mcos-shell. Prints the :latest digest or "-".
  tok=$(curl -s "https://ghcr.io/token?scope=repository:${GHCR_OWNER}/$1:pull" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
  [ -z "$tok" ] && { echo "-"; return; }
  curl -s -I -H "Authorization: Bearer $tok" \
    -H "Accept: application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.docker.distribution.manifest.v2+json" \
    "https://ghcr.io/v2/${GHCR_OWNER}/$1/manifests/latest" | tr -d '\r' | awk -F': ' 'tolower($1)=="docker-content-digest"{print $2}' | head -1
}

printf '%-9s %-15s %-11s %-10s %-14s %-14s\n' VERDICT CONTAINER STATE HEALTH RUNNING PUBLISHED
for c in $CONTAINERS; do
  if ! docker inspect "$c" >/dev/null 2>&1; then
    printf '%-9s %-15s %-11s %-10s %-14s %-14s\n' "NOTFOUND" "$c" "-" "-" "-" "-"
    [ $worst -lt 2 ] && worst=2
    continue
  fi
  state=$(docker inspect --format '{{.State.Status}}' "$c")
  health=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$c")
  running=$(docker inspect --format '{{if .Image}}{{.Image}}{{end}}' "$c" | sed 's/^sha256://' | cut -c1-12)
  repo_digest=$(docker inspect --format '{{index .RepoDigests 0}}' "$c" 2>/dev/null | sed -n 's/.*@sha256:\(.*\)/\1/p' | cut -c1-12)
  # Only the three GHCR images have a published digest to compare against.
  case "$c" in
    mcos-shell|mcos-ochi|mcos-pennypost)
      pub=$(ghcr_digest "$c" | sed 's/^sha256://' | cut -c1-12)
      # RepoDigests holds the manifest digest the image was pulled BY, which is what
      # GHCR's :latest resolves to — so equality means "this container runs what was
      # last published". If RepoDigests is empty the image was built locally.
      cmp_running=${repo_digest:-$running}
      ;;
    *) pub="n/a"; cmp_running=$running ;;
  esac
  verdict="OK"
  if [ "$state" != "running" ]; then verdict=$(echo "$state" | tr '[:lower:]' '[:upper:]'); [ $worst -lt 2 ] && worst=2
  elif [ "$health" = "unhealthy" ]; then verdict="UNHEALTHY"; [ $worst -lt 2 ] && worst=2
  elif [ "$pub" != "n/a" ] && [ -n "$pub" ] && [ "$pub" != "-" ] && [ "$pub" != "$cmp_running" ]; then verdict="BEHIND"; [ $worst -lt 1 ] && worst=1
  fi
  printf '%-9s %-15s %-11s %-10s %-14s %-14s\n' "$verdict" "$c" "$state" "$health" "$cmp_running" "$pub"
done

case $worst in
  0) echo "all containers running and current with GHCR" ;;
  1) echo "DRIFT: a container runs an older image than GHCR :latest — git pull, then compose pull + up -d for that service" ;;
  2) echo "ATTENTION: a container is not running or is unhealthy — check its logs" ;;
esac
exit $worst
