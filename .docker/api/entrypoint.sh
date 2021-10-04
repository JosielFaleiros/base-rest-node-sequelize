#!/bin/bash

yarn install

yarn global add pm2

#yarn dev
#yarn pm2-setup
yarn build
yarn pm2
#yarn debug

