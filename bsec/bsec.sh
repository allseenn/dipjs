#!/bin/bash
set -x
mkfifo /tmp/bsec
/usr/local/sbin/bsec -o > /tmp/bsec &
sleep 2
cat /tmp/bsec | /usr/local/sbin/mqtt &
while true; do
    /usr/sbin/local/rad.sh
    sleep 2
done
