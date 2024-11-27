#!/bin/bash
set -x
mkfifo /tmp/bsec
/usr/local/sbin/bsec -o > /tmp/bsec &
sleep 2
cat /tmp/bsec | /usr/local/sbin/mqtt &
# /usr/sbin/local/rad.sh &
node /home/slava/dipjs/web/web.js &
