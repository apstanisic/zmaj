---
title: Manual installation
---

In your Node project, install `zmaj` by running:

```bash
npm install zmaj
```

To configure app, pass config object to `runServer` function.
Zmaj will also look for `.env` file in project root, and use those values as config.

It is important to run all Zmaj migrations. You can make zmaj auto-run them by setting
`migrations.autoRunMigrations` to `true`. This will create necessary tables.
This value is `false` by default, because `zmaj` will never change schema without user's specified approval.
Every table will have `zmaj_` prefix to avoid clashes with user's tables.

## Passing values directly to `runServer`

```js
import { runServer } from "zmaj"

await runServer({
	// keep this key secret
	global: { secretKey: "my_secret_key_min_20_chars" },
	// this wil automatically create system tables
	migrations: { autoRunMigrations: true },
	// database params
	database: {
		database: "my_db",
		host: "localhost",
		username: "db_user",
		password: "db_password",
		port: 5432,
	},
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
If you want Zmaj to auto run migrations, pass `migrations.autoRunMigrations` as `true`.
You can run migrations manually by running:

```
npx zmaj migrate
```

This requires that you have your secrets in `.env` file, so that CLI knows how to connect to the database.

<!-- ## Secret key

Zmaj is using secret key to encrypt sensitive data. Please create secret key and keep it safe.
Zmaj will not work properly with changed key. For example, Zmaj will encrypt user's passwords after
hashing as an additional layer of security. Zmaj will not be able to sign user in if it can't access
user hashes.

```
plain-password > $argon2-password > encrypted-$argon2password
``` -->
