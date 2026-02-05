#!/bin/bash

pnpm run libs:ui:build || exit 1

pnpm run --filter realtime-elo-ranker-server start:dev &
pnpm run apps:client:dev &

sleep 5
xdg-open http://localhost:3000 &

trap "kill 0" EXIT
wait