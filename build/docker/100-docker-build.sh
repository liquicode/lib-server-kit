#!/bin/bash
. ./build/__secrets/build-env
echo "------------------------------------------"
echo "100-docker-build.sh"
echo " - DOCKER_IMAGE_NAME  = $DOCKER_IMAGE_NAME"
echo " - DOCKER_REPO_URL    = $DOCKER_REPO_URL"
echo "------------------------------------------"

docker build -t $DOCKER_IMAGE_NAME:latest . --file build/__secrets/$DOCKER_IMAGE_NAME.dockerfile
