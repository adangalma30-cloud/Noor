#!/usr/bin/env python3
"""Build the offline three-layer Quran database (assets/data/quran.db).

Layers per verse: Arabic (Tanzil Uthmani), transliteration (English romanization,
quran.com dataset via AlQuran.cloud edition en.transliteration), English
translation (ClearQuran, Talal Itani), Swahili translation (Ali Muhsin
Al-Barwani, AlQuran.cloud edition sw.barwani).

Inputs:
  src/data/quran-ar.json, src/data/quran-en.json, src/data/surahs.json
  /home/user/build/quran-data/translit.json, swahili.json (downloaded once)

Validates: 114 surahs, canonical per-surah counts, no empty layer cells,
6236 aligned rows, SQLite integrity. Fails loudly on any mismatch — the app
must never ship misaligned or fabricated Quran text.
"""
import json, os, sqlite3, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = '/home/user/build/quran-data'
OUT = os.path.join(ROOT, 'assets', 'data', 'quran.db')

ar = json.load(open(os.path.join(ROOT, 'src/data/quran-ar.json')))
en = json.load(open(os.path.join(ROOT, 'src/data/quran-en.json')))
surahs = json.load(open(os.path.join(ROOT, 'src/data/surahs.json')))
tr = json.load(open(os.path.join(DATA, 'translit.json')))['data']['surahs']
sw = json.load(open(os.path.join(DATA, 'swahili.json')))['data']['surahs']

trm = {s['number']: {a['numberInSurah']: a['text'] for a in s['ayahs']} for s in tr}
swm = {s['number']: {a['numberInSurah']: a['text'] for a in s['ayahs']} for s in sw}

errors, total = [], 0
os.makedirs(os.path.dirname(OUT), exist_ok=True)
if os.path.exists(OUT):
    os.remove(OUT)
con = sqlite3.connect(OUT)
con.execute('CREATE TABLE verses (surah INTEGER NOT NULL, ayah INTEGER NOT NULL, arabic TEXT NOT NULL, translit TEXT NOT NULL, en TEXT NOT NULL, sw TEXT NOT NULL, PRIMARY KEY (surah, ayah))')
con.execute('CREATE TABLE meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)')

if len(surahs) != 114:
    errors.append(f'surahs.json has {len(surahs)} surahs')

for m in surahs:
    s, n = m['id'], m['ayahs']
    ars, ens = ar.get(str(s), {}), en.get(str(s), {})
    for label, got in (('arabic', len(ars)), ('en', len(ens)), ('translit', len(trm.get(s, {}))), ('sw', len(swm.get(s, {})))):
        if got != n:
            errors.append(f'surah {s}: {label} count {got} != canonical {n}')
    for a in range(1, n + 1):
        row = (ars.get(str(a)), trm.get(s, {}).get(a), ens.get(str(a)), swm.get(s, {}).get(a))
        if any(not x or not str(x).strip() for x in row):
            missing = [lbl for lbl, x in zip(['ar', 'tr', 'en', 'sw'], row) if not x or not str(x).strip()]
            errors.append(f'{s}:{a}: empty layer(s) {missing}')
            continue
        con.execute('INSERT INTO verses VALUES (?,?,?,?,?,?)', (s, a, row[0], row[1], row[2], row[3]))
        total += 1

for k, v in {
    'arabic': 'Tanzil.net — Uthmani script (unchanged from NOOR 0.0.1)',
    'en': 'Translation by Talal Itani, ClearQuran.com.',
    'translit': 'Quran transliteration, English romanization (quran.com dataset, edition en.transliteration via AlQuran.cloud)',
    'sw': 'Kiswahili (Swahili) translation by Ali Muhsin Al-Barwani (edition sw.barwani via AlQuran.cloud)',
    'count': '6236 ayahs across 114 surahs',
}.items():
    con.execute('INSERT INTO meta VALUES (?,?)', (k, v))
con.commit()

if con.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
    errors.append('sqlite integrity_check failed')
if total != 6236:
    errors.append(f'inserted {total} rows, expected 6236')

print(f'rows: {total} | errors: {len(errors)}')
for e in errors[:20]:
    print('  !', e)
con.close()
if errors:
    sys.exit(1)
print(f'ALL CHECKS PASSED → {OUT} ({os.path.getsize(OUT)} bytes)')
