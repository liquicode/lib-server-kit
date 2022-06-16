#!/bin/bash
. ./build/__secrets/build-env
echo "------------------------------------------"
echo "801-docker-deploy-aws-ecr.sh"
echo " - DOCKER_IMAGE_NAME  = $DOCKER_IMAGE_NAME"
echo " - DOCKER_REPO_URL    = $AWS_DOCKER_REPO_URL"
echo " - AWS_PROFILE        = $AWS_PROFILE"
echo "------------------------------------------"

docker tag $DOCKER_IMAGE_NAME:latest $AWS_DOCKER_REPO_URL/$DOCKER_IMAGE_NAME
docker login -u AWS -p $(aws ecr get-login-password --profile $AWS_PROFILE) $AWS_DOCKER_REPO_URL
docker push $AWS_DOCKER_REPO_URL/$DOCKER_IMAGE_NAME
