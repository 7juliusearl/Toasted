#!/bin/bash
mkdir -p images

echo "Downloading images..."

curl -L -o "images/logo.png" "https://assets.cdn.filesafe.space/n5WdzNvEsQ5VrNYaRPii/media/633cfd35db047a42a159925b.png"
echo "Downloaded logo.png"

curl -L -o "images/logo-graphic.png" "https://assets.cdn.filesafe.space/n5WdzNvEsQ5VrNYaRPii/media/673ae50782e7cd79e867957c.png"
echo "Downloaded logo-graphic.png"

curl -L -o "images/kiosk-setup.png" "https://assets.cdn.filesafe.space/n5WdzNvEsQ5VrNYaRPii/media/673d2076f36e6007fb749c7d.png"
echo "Downloaded kiosk-setup.png"

curl -L -o "images/guests-interaction.png" "https://assets.cdn.filesafe.space/n5WdzNvEsQ5VrNYaRPii/media/673d2076f737375cb89fd286.png"
echo "Downloaded guests-interaction.png"

curl -L -o "images/lighting-sound.png" "https://assets.cdn.filesafe.space/n5WdzNvEsQ5VrNYaRPii/media/673d225b00a0d44ec5097c29.png"
echo "Downloaded lighting-sound.png"

curl -L -o "images/hero-intro.png" "https://assets.cdn.filesafe.space/n5WdzNvEsQ5VrNYaRPii/media/673d7e7ed88b41fd59f73441.png"
echo "Downloaded hero-intro.png"

curl -L -o "images/video-book.png" "https://assets.cdn.filesafe.space/n5WdzNvEsQ5VrNYaRPii/media/673d710817d9a91411461299.png"
echo "Downloaded video-book.png"

curl -L -o "images/usb-drive.jpeg" "https://assets.cdn.filesafe.space/n5WdzNvEsQ5VrNYaRPii/media/673d700d15ee06eba2c1a5ac.jpeg"
echo "Downloaded usb-drive.jpeg"

curl -L -o "images/hero-bg.jpeg" "https://assets.cdn.filesafe.space/c3cmUrbBhdgs54adfIYP/media/666136581848ae65069c5b9f.jpeg"
echo "Downloaded hero-bg.jpeg"

curl -L -o "images/sparkle.png" "https://assets.cdn.filesafe.space/75x6oVRlEkU7gyLcePUE/media/33045d7e-5160-4c8f-998e-672414b11c99.png"
echo "Downloaded sparkle.png"

echo "All downloads complete."
ls -l images/
