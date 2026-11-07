#!/bin/sh
# Ставит в чате с ботом кнопку меню, которая открывает апку.
# Запуск: ./set-menu.sh https://адрес-апки/
set -e
cd "$(dirname "$0")"
. ./.env
URL="$1"
[ -n "$URL" ] || { echo "Укажи адрес апки: ./set-menu.sh https://..."; exit 1; }

curl -s "https://api.telegram.org/bot$BOT_TOKEN/setChatMenuButton" \
  -H 'Content-Type: application/json' \
  -d "{\"menu_button\":{\"type\":\"web_app\",\"text\":\"Открыть\",\"web_app\":{\"url\":\"$URL\"}}}"
echo
