---
title: Environment variables
description: Customize usage of environment variables
---

Zmaj will use env values to configure app.

By default, Zmaj will look for `.env` file at the root of the project for config file.
Zmaj uses [dotenv](https://www.npmjs.com/package/dotenv) package under the hood.
Values passed to `runServer` directly will have precedence over values in `.env` file.
For all available options in `.env` file, look at project's Github repo, at file `.env.dev`.

### Configuring discovery of environment variables

```js
// Example env configuration
// Code bellow shows default config. All values are optional
await runServer({
	config: {
		/** Should we ignore `process.env` values, and only use env files */
		useProcessEnv: true,
		/** Should we ignore env file */
		useEnvFile: true,
		/** Path to the env file */
		envPath: ".env",
		/** Should we throw if env file does not exist */
		throwOnNoEnvFile: false,
	},
})
```

### Env file

By default, Zmaj will look for `.env` file at the root of the project for config file.
That location can be customized by passing `config: { envPath: 'custom-path/my-env-file' }` value to `runServer`.
If you want server to throws an error if file does not exist, set `throwOnNoEnvFile` to `true`.

### Disabling values

To disable reading values from current process, you can set `useProcessEnv: false`.
You can also disable using env files with `useEnvFile: false`.
