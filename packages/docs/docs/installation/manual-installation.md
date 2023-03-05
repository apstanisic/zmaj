---
title: Manual installation
---

### Requirements

- **Node.js** v18+
- **Postgres** database
- Typescript - optional, required if creating modules and providers since we need TS decorators
- Email provider (optional, needed for password reset, email confirmation)

## Install Zmaj

In your Node project, install `zmaj` by running:

```bash
npm install zmaj
```

To configure app, pass config object to `runServer` function, or specify `.env` file in the root of your project.

## Passing values directly to `runServer`

```js
import { runServer } from "zmaj"

await runServer({
	// keep this key secret
	global: { secretKey: "my_secret_key_min_20_chars" },
	// database params
	database: {
		database: "my_db",
		host: "localhost",
		username: "db_user",
		password: "db_password",
		port: 5432,
	},
	// this wil automatically run migrations that create necessary tables
	migrations: { autoRunMigrations: true },
})
```

## Using env file

Zmaj will by default look for `.env` file at project root. If you want to use custom path, pass `{ config: { envPath: ".env.dev" } }` to `runServer`:

```js
import { runServer } from "zmaj"

await runServer({
	config: { envPath: ".env.dev" },
	migrations: { autoRunMigrations: true },
})
```

You must provide secret key, and database configuration. Secret key must be at least 20 characters.
For configuring using environment variables, look at [this pages](../configuration), or look at the
[file we use during development](https://github.com/apstanisic/zmaj/blob/main/.env.dev).

<!-- ## Secret key

Zmaj is using secret key to encrypt sensitive data. Please create secret key and keep it safe.
Zmaj will not work properly with changed key. For example, Zmaj will encrypt user's passwords after
hashing as an additional layer of security. Zmaj will not be able to sign user in if it can't access
user hashes.

```
plain-password > $argon2-password > encrypted-$argon2password
``` -->

## Migrations

You must run migrations before starting to use Zmaj, since Zmaj stores it's data in database.
You can run them manually by running: `npx zmaj migrate`. It will ask you to provide a path to `.env` file,
so we know how to connect to the database.
You can make Zmaj run migration automatically by passing `{ migrations: { autoRunMigrations: true } }`.

## Decorators

If you are using features that require use of TS decorators, you must have decorators enabled in `tsconfig.json`.

```json
{
	"compilerOptions": {
		"emitDecoratorMetadata": true,
		"experimentalDecorators": true
	}
}
```
