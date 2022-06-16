@echo off

CALL build\__secrets\build-env.bat

echo ------------------------------------------
echo 100-docker-build.bat
echo  - BUILD_DOCKER_IMAGE_NAME = %BUILD_DOCKER_IMAGE_NAME%
echo  - BUILD_DOCKER_REPO_URL   = %BUILD_DOCKER_REPO_URL%
echo ------------------------------------------

docker build -t %BUILD_DOCKER_IMAGE_NAME%:latest . --file build/__secrets/%BUILD_DOCKER_IMAGE_NAME%.dockerfile
docker tag %BUILD_DOCKER_IMAGE_NAME%:latest %BUILD_DOCKER_REPO_URL%/%BUILD_DOCKER_IMAGE_NAME%
