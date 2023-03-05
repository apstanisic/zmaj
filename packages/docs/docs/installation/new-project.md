---
title: Create New Project
---

To create Zmaj project, run:

```bash
npx zmaj create-project my-project
```

This will scaffold basic project, generate valid `.env` file with generated secret key, and docker-compose file.
If you are not using database from `docker-compose`, you must configure database connection, either in `index.ts` or in `.env`.

### Requirements

- **Node.js** v18+
- **Postgres** database
- Typescript - optional, required if creating modules and providers since we need TS decorators
- Email provider (optional, needed for password reset, email confirmation)

## Project files

### `src/index.ts`

File that starts Zmaj. You can configure your Zmaj instance here. This file does not have any special meaning,
it's just entrypoint for your application.

### `.env`

Generates projects contains `.env` file that can be used as a starting point for connecting your app
to database. It provides valid connection to database and email server that are defined in `docker-compose`.

### `docker-compose.yml`

Every template comes with basic `docker-compose.yml` so you can easily start.
It contains `postgres` database and development email server.

## Secret key

Zmaj require from you a secret key that it will use for encrypting sensitive data.
When new project is created, we automatically generated random key and put it in `.env`.
If you want to change this key, you should change it before creating your first user.
You can pass custom key directly to `runServer` in `src/index.ts` with `{ global: { secretKey: 'my_custom_security_key' } } }`,
or replace `SECRET_KEY` value in `.env` .

## Creating first user

You can create admin users using Zmaj CLI.
This command requires `.env` file, with configured database params and secret key, so we can connect to DB to create user.

```bash
npx zmaj create-admin admin@example.com
```

If you want to use browser to create first user, you can go to [`http://localhost:5000/admin/#/auth/init`](http://localhost:5000/admin/#/auth/init) (if you have changed your `APP_URL`, replace `http://localhost:5000` with your hostname).
