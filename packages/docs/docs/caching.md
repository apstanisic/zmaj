---
title: Caching responses
---

Zmaj has support for caching `GET` requests. Every cache is scoped to current user.
This is the only way that will respect authorization. Caching is more noticeable for non signed-in user
since all non signed-in users share shame cache.
Only in memory cache is currently supported.
By default, cache is disabled, and default duration when enabled is 5 seconds.

## Configuring

```ts
// enable cache, and set "Time to live" to 10 seconds
runServer({
	cache: {
		enabled: true,
		ttlMs: 10000,
	},
})
```
