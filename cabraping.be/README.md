# Backend API Docs

| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| GET    | /              |                     |
| GET    | /api           |                     |
| GET    | /api/users     |                     |
| POST   | /api/users     |                     |
| GET    | /api/games     | Get all games       |
| GET    | /api/games/:id | Get one game by id  |
| POST   | /api/games     | Create a new game   |
| DELETE | /api/games/:id | Delete a game by id |

## HTTP Requests

```sh
http --json POST http://localhost:8000/api/friend_requests/ from_user=1 to_user=2
```

```sh
http --json http://localhost:8000/api/friend_requests/
```

## POST data

Login and create a token:

```sh
http --json POST localhost:8000/api/token/ username=toto@toto.com password=totototo
```

Get my friend requests:

```sh
http --json localhost:8000/api/friend_requests/me \
-A bearer -a eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.
```

Get all friend requests:

```sh
http --json localhost:8000/api/friend_requests/  \
-A bearer -a eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.
```

Create one friend request:

```sh
http --json POST localhost:8000/api/friend_requests/ to_user=4 \
-A bearer -a eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.
```
