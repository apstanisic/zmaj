---
title: Migrations
---

There are 2 types of migrations:

- system
<!-- - dynamic -->
- user migrations

## System Migrations

System migrations must be run in order to use the app. System migrations are always executed first, before user migrations.
If you want to run pending system migrations every time app starts, pass `true` to `autoRunMigrations` in migrations config.

```ts
await runServer({
	migrations: { autoRunMigrations: true },
})
```

## User migration

User is able to provide custom migrations that will be executed after system migrations.
To generate migration:

```bash
npx zmaj create-migration my_migration_name
```

This will create file with name, up and down migrations. Zmaj will use exported name to sort migrations.
To run this migration you need to import it into this app.
User migrations are run only if both `autoRunMigrations` and `autoRunUserMigrations` are `true`.
It's currently not possible to run them with CLI.

```ts
import * as MyMigration from "2023_01_03_20_12_36__my_migration.js"
runServer({
	migrations: {
		autoRunMigrations: true,
		autoRunUserMigrations: true,
		migrations: [MyMigration],
	},
})
```

<!-- ## Dynamic Migrations

**WIP Disabled Currently**
Dynamic migration is migration that is created during runtime when user changes schema with app.
On every change to schema, migration will be added to `zmaj_migrations`. Dynamic migration
contains `up` and `down` fields, that contain array of steps that needs to be executed.
When user creates new field, we will change schema, and create migration in same transaction.
So every dynamic migration will by default be executed.

Currently it is only used to see changes, but in the future it will be used to help migration from
dev to production environment, and contain ability to revert migrations. -->
