---
title: Getting started
slug: /
---

Zmaj is a headless CMS that provides RESTful API for your database and admin panel to easily manage your data.

Zmaj uses database tables directly without creating proprietary abstraction. That means that your
collection in Zmaj looks the same as table in your database. When you create field in Zmaj, that same field
will exist as a column, and vice versa. Every relation is backed by foreign key, so you can be sure that
there won't be any invalid values.
This allows you to use Zmaj as much or as little as you want.
You can have custom API to serve your frontend, and use Zmaj as an internal admin panel replacement.

Zmaj store all it's data in tables starting with `zmaj_` prefix.
So everything you need to do to remove Zmaj completely from your app is to just delete it's tables.

:::caution
Zmaj hasn't reached stable version yet, so please do not use it in production.
:::

## Quick Start Example

```bash
# Creates basic project
npx zmaj create-project zmaj-example
cd zmaj-example
npm install
# Starts docker with empty database and development email server in background
docker-compose --env-file .env up -d
# If you want to create example project with random data
npx zmaj create-example-schema -d
npm run dev
```

Then go to [`http://localhost:5000/admin/#/auth/init`](http://localhost:5000/admin/#/auth/init), to create first admin.

## Installation

**There are 3 ways to get started**

- [create new project](./installation/new-project.md)
- [run inside a docker container](./installation/docker.md)
- [manual installation](./installation/manual-installation.md)

## Demo

```
username:  admin@example.com
password:  password
```

Demos will be reset at the start of every hour. Data, images and auth sessions will be returned to default,
and you will have to login again.

If someone deleted `admin@example.com`,
there are `admin2@example.com` through `admin9@example.com` available with password `password`.

### Demo Simple Store

[Visit demo](https://demo-store.aleksandarstanisic.com)

Example of the naive web store admin panel.

### Demo Blog

[Visit demo](https://demo-blog.aleksandarstanisic.com)

Example of the the simple blog backend.

<!-- ## Create new project

To generate basic project, run:

```bash
npx zmaj create-project my-project
```

This will create basic scaffold, generate basic valid `.env` file with generated secret key, and `docker-compose` file.
If you are not using provided `docker-compose.yml`, you must configure database connection, either directly in `index.ts` or in `.env`.
Every project is generated to run migrations on startup, so Zmaj will create it's tables

### Creating first user

You can create admin users using Zmaj CLI.
This command requires `.env` file, with configured database params and secret key, so we can connect to DB to create user.

```bash
npx zmaj create-admin admin@example.com
```

If you want to use browser to create first user, you can go to [`http://localhost:5000/admin/#/auth/init`](http://localhost:5000/admin/#/auth/init) (if you have changed your `APP_URL`, replace `http://localhost:5000` with your hostname).

### Using `.env` file

Values that contain secrets (usernames, passwords...) can be passed both directly, and as an environment
variable.
For full example with all possible keys see `.env` in repository.

```bash
# .env
SECRET_KEY=my_secret_key_min_20_chars
DB_TYPE=postgres
DB_USERNAME=db_user
DB_PASSWORD=db_password
DB_DATABASE=dev_database
DB_HOST=localhost
DB_PORT=5432
```

```js
// index.js
runServer({
	migrations: { autoRunMigrations: true },
})
```

## Secret key

Zmaj requires secret key to encrypt sensitive data, cookies, and JWT tokens.
It must be string longer than 20 characters. If you used Zmaj CLI to create project, secret key will
be generated for you. You can generate secret key manually by running this command:

```bash title="CLI command to generate key"
npx zmaj generate-key
```

This will not override key if it already exist. You can specify env file path by passing `--env-file my-env-name`.

## Migrations

Zmaj stores it's data in database, and has required tables that it needs to function.
You can run command to run migrations.
To use this command you must have `.env` or `.env.dev` file so Zmaj knows how to connect to database.
You can specify env file path by passing `--env-file my-env-name`. It will run all zmaj system migrations.

```bash title="CLI command to run migrations"
npx zmaj migrate
# With custom env path
npx zmaj migrate --env-file .custom.env
```

:::caution
Currently, only system migrations can be run with CLI. In the future it will be possible to also
run user's migrations as well.
::: -->
