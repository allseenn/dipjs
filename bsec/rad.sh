#!/bin/bash
# Скрипт снятия показаний радиации с дозиметра RadSense
timeout=3
while true; do
    byte1=$(i2cget -y 1 0x66 0x03)
    byte2=$(i2cget -y 1 0x66 0x04)
    byte3=$(i2cget -y 1 0x66 0x05)
    value=$(( (byte1 << 16) | (byte2 << 8) | byte3 ))
    dinamic=$(echo "scale=1; $value * 0.1" | bc)
    
    byte1=$(i2cget -y 1 0x66 0x06)
    byte2=$(i2cget -y 1 0x66 0x07)
    byte3=$(i2cget -y 1 0x66 0x08)
    value=$(( (byte1 << 16) | (byte2 << 8) | byte3 ))
    static=$(echo "scale=1; $value * 0.1" | bc)
    
    echo "$dinamic $static"

    redis-cli dyn_rad $dinamic > /dev/null
    redis-cli stat_rad $static > /dev/null

    
    if [ -n "$1" ] && [ "$1" -eq 0 ]; then
        sleep $timeout
    else
        break
    fi
done
