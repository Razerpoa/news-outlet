#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="${DOCKER_IMAGE:-razorcut777/drekszone:latest}"
BUILD_CONTEXT="${DOCKER_BUILD_CONTEXT:-./web}"

printf 'Building Docker image: %s\n' "$IMAGE_NAME"
docker build -t "$IMAGE_NAME" "$BUILD_CONTEXT"

printf '\nPushing Docker image: %s\n' "$IMAGE_NAME"
docker push "$IMAGE_NAME"

printf '\nDone. Published image: %s\n' "$IMAGE_NAME"
