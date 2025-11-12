#!/bin/sh

echo "⏳ Waiting for MySQL to be ready..."
while ! nc -z kurchive-mysql 3306; do
  sleep 1
done

echo "✅ MySQL is ready, starting backend!"
exec uvicorn src.main:app --host 0.0.0.0 --port 8000
1~#!/bin/sh

echo "⏳ Waiting for MySQL to be ready..."
while ! nc -z kurchive-mysql 3306; do
  sleep 1
done

echo "✅ MySQL is ready, starting backend!"