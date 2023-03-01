---
title: Installation
slug: /
---

Zmaj is a CMS that provides RESTful API for your database, and admin panel to easily manage your data.

## Requirements

- **Node.js** v18+
- **Postgres** database
- **Typescript** - optional, required if creating modules and providers since we need TS decorators
- Email provider (optional, needed for password reset, email confirmation)
- Redis (optional)

## Generate project

To generate basic project, run:

```bash
npx zmaj create-project my-project
```

This will create simple project, generate basic valid `.env.dev` file with generated secret key, and docker-compose file.
After creating project, you must configure database connection, either in `index.ts` or in `.env.dev` file.

### Creating first user

You can create admin user using Zmaj CLI.
This command requires `.env` or `.env.dev` file, with configured database params and secret key, so we can connect to DB to create user.

Command will generate random password and print it on the screen.
You can pass `--use-password-password` to create user with password `password`, since it's common
to create that user when developing on local machine.

```bash
# Generates user with email admin@example.com and random password that will be printed in terminal
npx zmaj create-admin admin@example.com
# Generates user with email admin2@example.com and password "password"
npx zmaj create-admin admin2@example.com --use-password-password
```

### Using `.env` file

Values that contain secrets (usernames, passwords...) can be passed both directly, and as an environment
variable.
For full example with all possible keys see `.env.dev` in repository.

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
:::

### Decorators

If you are using features that require use of decorators, you must have decorators enabled in `tsconfig.json`.
This is already configured if you are using cli to generate project.

```json
{
	"compilerOptions": {
		"emitDecoratorMetadata": true,
		"experimentalDecorators": true
	}
}
```
