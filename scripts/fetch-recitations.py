#!/usr/bin/env python3
"""
Download the complete CC0 Quran recitation sets from archive.org for import into Noor.

Usage:
    python3 fetch-recitations.py --reciter muammar --out ./quran-audio
    python3 fetch-recitations.py --reciter ghamdi --surahs 36 55 67 --out ./quran-audio

Surah files are named NNN.mp3 (e.g. 036.mp3) so Noor's importer recognises them.
"""
import argparse
import json
import os
import sys
import time
import urllib.request

ITEMS = {
    "muammar": ["muammar_murottal_first", "muammar_murottal_full"],
    "ghamdi": ["Quran-MP3-Ghamdi"],
}

UA = {"User-Agent": "NoorAppBuild/1.0 (fetching CC0 recitations for personal offline use)"}


def item_files(item):
    req = urllib.request.Request(f"https://archive.org/metadata/{item}", headers=UA)
    data = json.load(urllib.request.urlopen(req))
    return data.get("server"), data.get("dir"), [
        f for f in data.get("files", []) if f["name"].lower().endswith(".mp3")
    ]


def find_surah(files, n, reciter):
    for f in files:
        name = f["name"]
        if reciter == "muammar" and name.startswith(f"MuammarZA_Murottal_{n:03d}_"):
            return name, int(f.get("size", 0))
        if reciter == "ghamdi" and name == f"{n:03d}.mp3":
            return name, int(f.get("size", 0))
    return None, 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reciter", choices=ITEMS.keys(), default="muammar")
    ap.add_argument("--surahs", nargs="*", type=int, default=list(range(1, 115)))
    ap.add_argument("--out", default="./quran-audio")
    args = ap.parse_args()

    out_dir = os.path.join(args.out, args.reciter)
    os.makedirs(out_dir, exist_ok=True)

    catalogs = [item_files(item) for item in ITEMS[args.reciter]]
    total_mb = 0.0
    for n in args.surahs:
        dest = os.path.join(out_dir, f"{n:03d}.mp3")
        if os.path.exists(dest) and os.path.getsize(dest) > 5000:
            print(f"have {n:03d}")
            continue
        hit = None
        for server, dir_, files in catalogs:
            name, size = find_surah(files, n, args.reciter)
            if name:
                hit = (server, dir_, name, size)
                break
        if not hit:
            print(f"MISSING surah {n}", file=sys.stderr)
            continue
        server, dir_, name, size = hit
        import urllib.parse
        url = f"https://{server}{dir_}/{urllib.parse.quote(name)}"
        for attempt in range(5):
            try:
                req = urllib.request.Request(url, headers=UA)
                with urllib.request.urlopen(req) as r, open(dest, "wb") as f:
                    f.write(r.read())
                total_mb += os.path.getsize(dest) / 1e6
                print(f"OK  {n:03d}  {os.path.getsize(dest)/1e6:.2f} MB")
                break
            except Exception as e:
                print(f"retry {n}: {e}", file=sys.stderr)
                time.sleep(4 * (attempt + 1))
        time.sleep(1)
    print(f"\nDone — {total_mb:.1f} MB in {out_dir}")
    print("In the app: Adhan → Import recitation files, then select these .mp3 files.")


if __name__ == "__main__":
    main()
