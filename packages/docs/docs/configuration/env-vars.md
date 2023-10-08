---
title: Environment variables
description: Customize usage of environment variables
---

Zmaj will use env values to configure app.

<!-- By default, Zmaj will look for `.env` file at the root of the project for config file. -->

Zmaj uses [dotenv](https://www.npmjs.com/package/dotenv) package under the hood.
Values passed to `runServer` directly will have precedence over values in `.env` file.
For all available options in `.env` file, look at project's Github repo, at file `.env`.

### Configuring discovery of environment variables

```js
// Example env configuration
// Code bellow shows default config. All values are optional
await runServer({
	config: {
		/** Should we ignore `process.env` values, and only use env files */
		useProcessEnv: true,
		/** Path to the env file */
		envPath: ".env",
	},
})
```

### Env file

By default, Zmaj will look for `.env` file at the root of the project for config file.
That location can be customized by passing `config: { envPath: 'custom-path/my-env-file' }` value to `runServer`.

### Disabling values

To disable reading values from current process, you can set `useProcessEnv: false`.
You can also disable using env files with `useEnvFile: false`.
