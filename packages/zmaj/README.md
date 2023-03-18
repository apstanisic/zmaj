# Zmaj

Zmaj is a CMS that provides RESTful API for your database, and admin panel to easily manage your data.

Check out full documentation at [zmaj.vercel.app](https://zmaj.vercel.app)

## Requirements

- **Node.js** v18+
- **Postgres** database
- **Typescript** - optional, required if creating modules and providers since we need TS decorators
- Email provider (optional, needed for password reset, email confirmation)
- Redis (optional)

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

## Docker

If you do not have NodeJS, you can run Zmaj with docker, [read more here](https://zmaj.vercel.app/docs/installation/using-docker).

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
