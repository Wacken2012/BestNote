#!/bin/bash
# Testskript für BestNote Backend-API
# Führt alle Tests mit korrektem PYTHONPATH und aktiviertem venv aus

cd "$(dirname "$0")"/..
cd bestnote
source backend/venv/bin/activate
PYTHONPATH=$(pwd) pytest backend/tests/ --maxfail=3 --disable-warnings -v
