---
title: Database
description: Database configuration
---

Postgres database is required.
Zmaj will create several tables with `zmaj_` prefix (similar to Wordpress' `wp_` prefix) for storing system data.

## Configuring database

It is possible to pass config for database as values to `runServer` or as env vars.

### With code

```js
import { runServer } from "zmaj"
// Example database configuration
await runServer({
	database: {
		username: "db_user",
		password: "db_password",
		host: "localhost",
		database: "my_app_db",
		port: 5432,
		// should we log sql queries to console (optional)
		logging: false,
	},
})
```

### Env variables

You can set database params with env values.
Example:

```bash
DB_USERNAME=db_user
DB_PASSWORD=db_password
DB_DATABASE=dev_database
DB_HOST=localhost
DB_PORT=5432
```

### Mix of both

You can pass some values with code, and some as environment value.

```js
// index.js
import { runServer } from "zmaj"
await runServer({
	database: {
		username: "db_user",
		// password is not specified
		host: "localhost",
		database: "my_app_db",
		port: 5432,
	},
})
```

```bash
# .env
DB_PASSWORD=db_password
```
