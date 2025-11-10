#!/bin/bash

# With help from https://gist.github.com/steinwaywhw/a4cd19cda655b8249d908261a62687f8?permalink_comment_id=5596446#gistcomment-5596446

if ! command -v unzip &> /dev/null; then
	echo Please install unzip
	exit 1
fi

PATCH_VERSION=$(curl -sLI https://github.com/espressif/esptool/releases/latest | sed '\|location:.*/tag/|I!d; s|||' | tail -1 | tr -d " \t\n\r")
printf "Version: $PATCH_VERSION\n\n"

printf "Downloading Linux-AMD64 version...\n"
curl -L# --output esptool.tar.gz https://github.com/espressif/esptool/releases/latest/download/esptool-${PATCH_VERSION}-linux-amd64.tar.gz
tar -xvzf esptool.tar.gz
cp ./esptool-linux-amd64/esptool ./public/esptool
chmod 744 ./public/esptool
rm esptool.tar.gz
rm -R esptool-linux-amd64
printf "\n"

printf "Downloading Linux-ARMv7 version...\n"
curl -L# --output esptool.tar.gz https://github.com/espressif/esptool/releases/latest/download/esptool-${PATCH_VERSION}-linux-armv7.tar.gz
tar -xvzf esptool.tar.gz
cp ./esptool-linux-armv7/esptool ./public/esptoolarm
chmod 744 ./public/esptoolarm
rm esptool.tar.gz
rm -R esptool-linux-armv7
printf "\n"

printf "Downloading Linux-ARM64 version...\n"
curl -L# --output esptool.tar.gz https://github.com/espressif/esptool/releases/latest/download/esptool-${PATCH_VERSION}-linux-aarch64.tar.gz
tar -xvzf esptool.tar.gz
cp ./esptool-linux-aarch64/esptool ./public/esptoolarm64
chmod 744 ./public/esptoolarm64 
rm esptool.tar.gz
rm -R esptool-linux-aarch64
printf "\n"

printf "Downloading MacOS-AMD64 version...\n"
curl -L# --output esptool.tar.gz https://github.com/espressif/esptool/releases/latest/download/esptool-${PATCH_VERSION}-macos-amd64.tar.gz
tar -xvzf esptool.tar.gz
cp ./esptool-macos-amd64/esptool ./public/esptoolmac
rm esptool.tar.gz
rm -R esptool-macos-amd64
printf "\n"

printf "Downloading Windows version...\n"
curl -L# --output esptool.zip https://github.com/espressif/esptool/releases/latest/download/esptool-${PATCH_VERSION}-windows-amd64.zip
unzip esptool.zip
cp ./esptool-windows-amd64/esptool.exe ./public/esptool.exe
rm esptool.zip
rm -R esptool-windows-amd64
printf "\nDone!\n"