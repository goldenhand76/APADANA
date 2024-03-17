#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
  echo "Waiting for postgres..."

  while ! nc -z "$POSTGRES_HOST" "$POSTGRES_PORT"; do
    sleep 0.1
    echo "Waiting for postgres..."
  done

  echo "PostgrSQL started"
fi

#python manage.py flush
python manage.py check
python manage.py migrate --no-input
python manage.py collectstatic --no-input
exec "$@"