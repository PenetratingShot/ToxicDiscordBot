#!/usr/bin/env bash

if ! pgrep -x "node server" > /dev/null
then
    echo "Stopped. Restarting Process"
    node server
fi