<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Setting up the database
### 1. Docker

Make sure Docker already running in your machine. If you use macOS, better to use OrbStack as it's the lightest Docker app on Mac. If not, then just use Docker on Linux or Docker Desktop on Windows.

### 2. Docker Compose

Use Docker Compose to run the PostgreSQL database.

- `docker compose up` will run on the foreground
- `docker compose up -d` will run on the background (daemon mode) 

### 3. Environment Variable

Make sure the `.env` file is already created and have the required values. If it's in local, the host should be `localhost`.

```
DATABASE_URL="postgres://puser:123@localhost:5432/cabraping_db"
```

If it's in production, the host might not be `localhost`.

```
DATABASE_URL="postgres://production_user:production_password@production_host:5432/production_cabraping_db"
```

### 4. Prisma DB Push

Run Prisma database push to sync the schema into the database

- `npm prisma db push`
- `pnpm prisma db push`
- `npm run db:push`
- `pnpm db:push` 

Note: While in development, let's avoid to use Prisma migration files because it will take a lot of time to manage when we're still experimenting and have many changes on the schema.

### 5. Prisma Studio

Use Prisma studio to see the whole created or updated tables along with their relations, based on the latest schema sync by Prisma DB Push.

- `pnpm db:studio`

Open `localhost:5555`.

### 6. Database Table Viewer

Use database table viewer like TablePlus (available on Mac, Linux, Windows) to see the created or updated tables, based on the latest schema sync by Prisma DB Push. Because of the nature of SQL database, you cannot look at the relationals directly without table joins. That's why Prisma Studio is being used to make it easier.

### 7. Seed Dummy Data (WIP)

(WIP)

- `pnpm db:seed`


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
