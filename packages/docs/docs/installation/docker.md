---
title: Using Docker
slug: using-docker
---

You don't have to have NodeJS to play with Zmaj. You can create `docker-compose.yml` with options bellow,
or use it as a starting point for adapting it to your needs:

```yml
version: "3.9"
services:
  app:
    image: astanisic/zmaj:0
    depends_on:
      - database
      - email
    ports:
      - 5000:5000
    volumes:
      - zmaj_storage_volume:/app/files
    environment:
      APP_NAME: Zmaj Example
      APP_URL: http://localhost:5000
      APP_POR: 5000
      #
      SECRET_KEY: change_this_secret_key
      #
      DB_USERNAME: db_user
      DB_PASSWORD: db_password
      DB_DATABASE: dev_database
      DB_PORT: 5432
      DB_HOST: database
      #
      EMAIL_ENABLED: true
      EMAIL_USER: noreply@example.com
      EMAIL_PASSWORD: password
      EMAIL_PORT: 1025
      EMAIL_HOST: email

  database:
    image: postgres:15-alpine
    restart: unless-stopped
    ports:
      - 5432:5432
    environment:
      POSTGRES_USER: db_user
      POSTGRES_PASSWORD: db_password
      POSTGRES_DB: dev_database
    volumes:
      - zmaj_db_volume:/var/lib/postgresql/data

  # enables email testing without external testing service
  email:
    image: mailhog/mailhog
    ports:
      - 1025:1025
      - 8025:8025

volumes:
  zmaj_db_volume:
  zmaj_storage_volume:
```

This file will run Zmaj in Docker, with Postgres database, and test email server.
You can then go to `http://localhost:5000/admin/#/auth/init` to create admin user.

## Configuring Zmaj in Docker

### Passing env values directly

You can pass values directly as environment variable in Docker
For example:

```yaml
services:
  app:
    image: astanisic/zmaj:0
    environment:
      APP_NAME: Zmaj Example
```

### .env file

You can provide env file to your docker as file at `/app/.env`.
In your `docker-compose.yml` write:

```yaml
services:
  app:
    image: astanisic/zmaj:0
    volumes:
      - ./.env:/app/.env
```

### JSON

You can provide your Zmaj config as a `/app/zmaj-config.json` file. You can mount config file as a volume that Zmaj can read.
It accepts all the options that `runServer` accepts. Internally, Zmaj reads provided file if it exists,
and passes it to `runServer`.

```yaml
services:
  app:
    image: astanisic/zmaj:0
    ## Path to your zmaj config
    volumes:
      - ./zmaj-config.json:/app/zmaj-config.json
```

And your json config would look something like this:

```json
{
	"files": { "maxUploadSize": 10000 },
	"authentication": { "allowBasicAuth": true },
	"database": {
		"username": "john",
		"database": "zmaj_database"
	}
}
```
