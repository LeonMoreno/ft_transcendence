# ft_transcendence

# Django:

## For the backend you need to use Redis:

Using and checking the status of Redis is essential in certain programming and development contexts, especially when working with applications that require a channel layer, such as Django Channels. Here's why it's necessary:

Backend Functionality for Django Channels: Django Channels requires a backend to handle the channel layer, which is crucial for managing things like WebSockets, group channels, and other real-time communication protocols. Redis is a popular choice for this purpose due to its performance and ease of use.

Real-Time Communication: In applications that require real-time communication (such as chat, live notifications, etc.), it's important to have a system that can efficiently handle and transmit messages. Redis acts as an intermediary storage and messaging system for these types of communications.

Scalability and Performance: Redis is known for its high speed and ability to handle a large number of connections, making it ideal for real-time applications that need scalability and solid performance.

Optional Persistence and Advanced Data Structures: Although in the context of Django Channels, Redis is often used as an in-memory messaging system, it also offers features like data persistence and advanced data structures, making it useful in a variety of other contexts.

Compatibility and Community Support: Redis is widely used and supported in the developer community. This means there is a wide range of resources, libraries, and support available, which makes it easier to integrate and use in development projects.

Ensuring that Redis is running and correctly configured is a crucial step in the setup and debugging process of any application that uses it, especially when working with real-time technologies like Django Channels. Without Redis running, these applications will not be able to properly handle real-time connections or utilize the storage and messaging features that Redis provides.

## isntall redis MACOS

- brew install redis

### Check Redis Status: Run the following command to see if Redis is running:

- redis-cli ping

If Redis is up and running correctly, you should receive a PONG response.

### Check Redis Processes: You can also check if Redis is running by checking the active processes. Run this command:

- ps aux | grep redis

If Redis is running, you should see one or more lines that include redis-server.

### Start Redis Manually:

If Redis is not running, you can try to start it manually. If you installed Redis using Homebrew, you can start Redis with the following command:

- brew services start redis

This will start the Redis service and configure it to start automatically at boot.x

## pip intall

- pip install -r pip_environment_dependencies.txt

### PosgresSQL

Migrate the database. You must have a database named "transcendence_db"

```sh


python3 manage.py makemigrations chat users
```

```sh
python3 manage.py migrate

python3 manage.py migrate users
python3 manage.py migrate chat
```

## Run Server

```sh
python3 manage.py runserver
```

