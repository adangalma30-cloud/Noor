#!/usr/bin/env bash
# Download the transliteration + Swahili layers ONCE at build time (never at
# runtime — NOOR is fully offline). Then run: python3 scripts/build-quran-db.py
set -euo pipefail
mkdir -p /home/user/build/quran-data
cd /home/user/build/quran-data
curl -fsSL "https://api.alquran.cloud/v1/quran/en.transliteration" -o translit.json
curl -fsSL "https://api.alquran.cloud/v1/quran/sw.barwani" -o swahili.json
echo "Downloaded $(ls -la translit.json swahili.json | wc -l) layer files."
