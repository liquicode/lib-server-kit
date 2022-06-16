@echo off

CALL build\__secrets\build-env.bat

echo ------------------------------------------
echo 101-docker-bash.bat
echo  - DOCKER_IMAGE_NAME = %BUILD_DOCKER_IMAGE_NAME%
echo ------------------------------------------

docker run -it															^
	--publish 4200:80/tcp												^
	--name %BUILD_DOCKER_IMAGE_NAME%									^
	%BUILD_DOCKER_IMAGE_NAME%											^
	/bin/bash
