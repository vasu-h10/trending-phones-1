#!/data/data/com.termux/files/usr/bin/bash

while true
do
echo "Updating phones..."
node updatePhones.js
echo "Update finished. Next update in 1 hour..."
sleep 3600
done

