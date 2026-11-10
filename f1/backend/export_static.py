"""Export every API response the frontend uses as static JSON files.

This lets the site run without a live Flask server (for example on GitHub Pages).
The files are written so that each API path maps to a file:

    /api/drivers                     -> api/drivers.json
    /api/races/1/results             -> api/races/1/results.json
    /api/results?driver_id=norris    -> api/results/driver_id/norris.json

Usage:
    python export_static.py [output_dir]

The output directory defaults to ../frontend/public/api.
"""
import json
import os
import sys

from app import app, BASE_DIR
from models import Driver, Constructor, Race


def export(output_dir):
    client = app.test_client()
    written = 0

    def save(api_path, relative_file):
        nonlocal written
        response = client.get(api_path)
        if response.status_code != 200:
            raise SystemExit(f"{api_path} returned {response.status_code}")
        data = response.get_json()
        if isinstance(data, list) and not data:
            print(f"warning: {api_path} returned no rows")
        target = os.path.join(output_dir, *relative_file.split('/'))
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        written += 1

    with app.app_context():
        driver_ids = [d.driver_id for d in Driver.query.all()]
        constructor_ids = [c.constructor_id for c in Constructor.query.all()]
        race_ids = [r.race_id for r in Race.query.all()]

    if not driver_ids or not race_ids:
        raise SystemExit("The database is empty - run notebooks/01_database_setup.ipynb first.")

    # Collections
    for name in ['drivers', 'constructors', 'races', 'results', 'qualifying',
                 'standings/drivers', 'standings/constructors']:
        save(f'/api/{name}', f'{name}.json')

    # Per-driver detail and results
    for driver_id in driver_ids:
        save(f'/api/drivers/{driver_id}', f'drivers/{driver_id}.json')
        save(f'/api/results?driver_id={driver_id}', f'results/driver_id/{driver_id}.json')

    # Per-team detail and results
    for constructor_id in constructor_ids:
        save(f'/api/constructors/{constructor_id}', f'constructors/{constructor_id}.json')
        save(f'/api/results?constructor_id={constructor_id}', f'results/constructor_id/{constructor_id}.json')

    # Per-race detail, results and qualifying
    for race_id in race_ids:
        save(f'/api/races/{race_id}', f'races/{race_id}.json')
        save(f'/api/races/{race_id}/results', f'races/{race_id}/results.json')
        save(f'/api/races/{race_id}/qualifying', f'races/{race_id}/qualifying.json')

    print(f"Wrote {written} files to {output_dir}")


if __name__ == '__main__':
    default_dir = os.path.join(BASE_DIR, '..', 'frontend', 'public', 'api')
    export(os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else default_dir))
