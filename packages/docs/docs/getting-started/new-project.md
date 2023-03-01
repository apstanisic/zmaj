---
title: New Project
---

To generate basic project, run:

```bash
npx zmaj create-project my-project
```

This will create simple project, generate basic valid `.env.dev` file with generated secret key, and docker-compose file.
After creating project, you must configure database connection, either in `index.ts` or in `.env.dev` file.

## .env File

Template generates simple `.env.dev` file that can be used as a starting point for connecting your app
to database.

### Secret key

Secret key is generated when project is created, so it's safe to use it. If you want to change
your secret key, do it before creating your first user, since Zmaj will encrypt some sensitive data.

## Docker Compose

Every template comes with basic `docker-compose.yml` so you can easily start.
File will always contain basic `postgres` database, and some templates will contain more services.

## Decorators

If you are using features that require use of decorators, you must have decorators enabled in `tsconfig.json`.

```json
{
	"compilerOptions": {
		"emitDecoratorMetadata": true,
		"experimentalDecorators": true
	}
}
```
