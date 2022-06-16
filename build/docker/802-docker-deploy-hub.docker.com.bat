@echo off

CALL build\__secrets\build-env.bat

echo ------------------------------------------
echo 802-docker-deploy-hub.docker.com
echo  - BUILD_DOCKER_IMAGE_NAME = %BUILD_DOCKER_IMAGE_NAME%
echo  - BUILD_DOCKER_REPO_URL   = %BUILD_DOCKER_REPO_URL%
echo ------------------------------------------

docker tag %BUILD_DOCKER_IMAGE_NAME%:latest %BUILD_DOCKER_REPO_URL%/%BUILD_DOCKER_IMAGE_NAME%
docker push %BUILD_DOCKER_REPO_URL%/%BUILD_DOCKER_IMAGE_NAME%
