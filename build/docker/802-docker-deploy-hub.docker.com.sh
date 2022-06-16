#!/bin/bash
. ./build/__secrets/build-env
echo "------------------------------------------"
echo "802-docker-deploy-ub.docker.com.sh"
echo " - DOCKER_IMAGE_NAME  = $DOCKER_IMAGE_NAME"
echo " - DOCKER_REPO_URL    = $DOCKER_REPO_URL"
echo "------------------------------------------"

docker tag $DOCKER_IMAGE_NAME:latest $DOCKER_REPO_URL/$DOCKER_IMAGE_NAME
docker push $DOCKER_REPO_URL/$DOCKER_IMAGE_NAME
