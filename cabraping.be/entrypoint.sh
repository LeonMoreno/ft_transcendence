#!/bin/sh



while ! nc -z database 5432; do
  sleep 0.1
done



# Execute migrations
python3 manage.py migrate users
python3 manage.py migrate chat
python3 manage.py migrate game
python3 manage.py migrate
python3 manage.py migrate

python3 manage.py makemigrations chat users game

# # Starts the server
python manage.py runserver 0.0.0.0:8000

# Execute the command passed to docker run or docker-compose up
exec "$@"
