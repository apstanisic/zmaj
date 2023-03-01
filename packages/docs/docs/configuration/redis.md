---
title: Redis
description: Redis configuration (optional)
---

Redis is used for minor caching and verifying some data. It is optional.

## Configuring

```js
// Example redis configuration. All values are optional. It is disabled by default.
runServer({
	redis: {
		// defaults to 127.0.0.1
		host: "localhost",
		// defaults to 6379
		port: 6379,
		// defaults to no username
		username: "username",
		// defaults to no password
		password: "password",
		// is redis enabled, default to `false`
		enabled: true,
	},
})
```

### Env values

Zmaj supports providing Redis configuration with env variables. If values are provided both via code
and via env, values in code will be used.

Example:

```bash
REDIS_PORT=6379
REDIS_HOST=localhost
REDIS_ENABLED=true
REDIS_USERNAME=user
REDIS_PASSWORD=password
```

### Disabling access tokens

Redis is used for disabling access tokens, when user account is compromised (hacked). If there is no redis,
compromised access token will be valid until it reaches end of life (20 minutes by default).
