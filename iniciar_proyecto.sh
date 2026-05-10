#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "=========================================="
echo " Sistema Activos FISEI - Sprint 1"
echo "=========================================="
echo

if [ ! -d "node_modules" ]; then
  echo "Instalando dependencias con npm install..."
  npm install
fi

echo "Iniciando backend en http://localhost:3000"
npm run dev &
BACKEND_PID=$!

sleep 3

echo "Iniciando frontend en http://localhost:5173"
npm run frontend &
FRONTEND_PID=$!

echo
echo "Todo listo. Abre http://localhost:5173"
echo "Usuario de prueba: andrew.lara@uta.edu.ec"
echo
echo "Presiona Ctrl+C para detener backend y frontend."

trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true' EXIT
wait
