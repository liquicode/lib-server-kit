#!/bin/bash
. build/__secrets/build-env
npx webpack-cli --config build/__secrets/$IMAGE_NAME.webpack.config.js
