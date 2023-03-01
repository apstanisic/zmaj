# Zmaj

Zmaj is a CMS that provides RESTful API for your database, and admin panel to easily manage your data.

Check out full documentation at [zmaj.vercel.app](https://zmaj.vercel.app)

## Requirements

- **Node.js** v18+
- **Postgres** database
- **Typescript** - optional, required if creating modules and providers since we need TS decorators
- Email provider (optional, needed for password reset, email confirmation)
- Redis (optional)

## Quick start

To generate basic project, run command:

```bash
# `zmaj-example` is folder name where to create project
npx zmaj create-project zmaj-example
```

This will create simple project, generate valid `.env` file with generated secret key, and docker-compose file.
After creating project, you should configure database connection (if not using built in docker compose), either in `index.ts` or in `.env` file. Every generated project comes with configured `docker-compose` file and `.env`

You can then run `npx zmaj create-admin` to create admin user.

## Docker

You can run Zmaj without NodeJS with docker-compose, [read more](https://zmaj.vercel.app/docs/getting-started/using-docker).

### Creating first user

You can create admin user using Zmaj CLI.
This command requires file `.env` file, with configured database params and secret key, so we can connect to DB to create user.

```bash
npx zmaj create-admin
```
