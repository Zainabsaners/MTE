#!/usr/bin/env bash
# build.sh - Render build script

echo "=== Installing dependencies ==="
pip install -r requirements.txt

echo "=== Collecting static files ==="
python manage.py collectstatic --noinput --clear

echo "=== Running migrations ==="
python manage.py makemigrations
python manage.py migrate

echo "=== Build completed ==="
