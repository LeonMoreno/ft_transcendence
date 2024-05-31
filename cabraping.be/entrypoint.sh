#!/bin/sh



while ! nc -z database 5432; do
  sleep 0.1
done



# Execute migrations
python3 manage.py migrate users
python3 manage.py migrate chat
python3 manage.py migrate auth42
python3 manage.py migrate game
python3 manage.py migrate
python3 manage.py migrate


python3 manage.py makemigrations chat users game

# # Starts the server
#python manage.py runserver 0.0.0.0:8000
#python -m http.server --bind 0.0.0.0 --cgi --cert /app/localhost.crt --key /app/localhost.key 8000
python manage.py runserver_plus --cert-file /app/localhost.crt --key-file /app/localhost.key 8000


# Execute the command passed to docker run or docker-compose up
exec "$@"
