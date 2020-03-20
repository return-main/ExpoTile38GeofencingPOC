#!/usr/bin/env bash
docker pull tile38/tile38
docker run --name tile38 -p 9851:9851 tile38/tile38
