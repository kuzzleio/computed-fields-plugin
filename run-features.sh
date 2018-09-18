#!/bin/bash

docker-compose -f ./docker/docker-compose.yml down
docker-compose -f ./docker/docker-compose.yml up -d

echo "Waiting for Kuzzle to be up and running...."
 ./features/wait_for_kuzzle
if [ $? -eq 0 ]
then
    echo "Running functional tests..."
    ./node_modules/cucumber/bin/cucumber-js -f json:report/cucumber-report.json
    echo "Generating test report..."
    node report/index.js
fi
docker-compose -f ./docker/docker-compose.yml down
