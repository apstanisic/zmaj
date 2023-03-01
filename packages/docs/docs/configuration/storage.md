---
title: File Storage
description: Storage configuration (optional)
---

Zmaj has support for storing files. It supports storing files on local filesystem, in a S3 bucket,
or anywhere with provided adapters.
You can provide multiple providers, and then choose where to store file with HTTP header `zmaj-storage-provider`.

If no configuration for storage is provided, we will default to local storage, in `files` directory at project root.
To disable this option, pass `enableFallbackStorage: false` to storage config.

You can set `uploadDisabled` when configuring provider to disable upload, but still using existing files.
This is useful if you want to prevent any new upload to that storage,
but still need access to files that are stored there, for example when migrating storage providers.

## Configuring with code

### With classes

If you are passing config with code, this is recommended way since there is TypeScript support and Zod validation.

```js
import { runServer, LocalStorageConfig, S3StorageConfig } from "zmaj"

await runServer({
	storage: {
		providers: [
			// example using classes
			// if you are passing config with code, this is recommended way since there is
			// TypeScript support
			new S3StorageConfig({
				/* pass config */
			}),
			new LocalStorageConfig({
				/* pass config */
			}),
		],
	},
})
```

### With POJO (plain old javascript object)

```js
import { runServer } from "zmaj"

await runServer({
	storage: {
		providers: [
			// example local filesystem storage
			{
				name: "current_device",
				type: "local",
				uploadDisabled: false,
				// if path is absolute, it will start at filesystem root,
				// otherwise it will start at project root
				basePath: "dist/files",
			},
			// example s3 storage
			{
				name: "france_storage",
				type: "s3",
				basePath: "/my_files",
				accessKey: "access-key",
				secretKey: "secret-key",
				bucket: "bucket-name",
				endpoint: "https://example.com",
				region: "fr",
				uploadDisabled: false,
				// should we create bucket if provided bucket does not exist (optional, defaults to false)
				createMissingBucket: false,
			},
		],
	},
})
```

## Env variables

Zmaj supports providing storage configuration with env variables.
You can think of double underscore (\_\_) as nesting.
Since you can have many different storages, we must nest config.
For example `STORAGE_PROVIDERS__STORAGE_1__TYPE=s3`, will get us
`{ STORAGE_1: { type: "s3" } }`

<!-- Since there can be multiple storage providers, syntax is a little bit different.
Zmaj will read `STORAGE_PROVIDERS` value, to determine a list of available providers,
Every value starts with `STORAGE_PROVIDERS`, double underscore (`__`), uppercase provider name, double underscore,
provider specific key.
For example, to get bucket name of `MY_FILES`, you would write `STORAGE_PROVIDERS__MY_FILES__BUCKET`. -->

Example for both local and s3 storage is bellow

```bash

# Filesystem Storage
STORAGE_PROVIDERS__FS__TYPE=local
STORAGE_PROVIDERS__FS__BASE_PATH=my_files
STORAGE_PROVIDERS__FS__NAME=my_fs

# S3 Storage
STORAGE_PROVIDERS__MINIO__TYPE=s3
STORAGE_PROVIDERS__MINIO__ACCESS_KEY=minio-key
STORAGE_PROVIDERS__MINIO__SECRET_KEY=minio-secret
STORAGE_PROVIDERS__MINIO__BUCKET=dev-bucket
STORAGE_PROVIDERS__MINIO__REGION=lg-test
STORAGE_PROVIDERS__MINIO__ENDPOINT=http://localhost:9000
STORAGE_PROVIDERS__MINIO__NAME=my_minio
STORAGE_PROVIDERS__MINIO__UPLOAD_DISABLED=false
STORAGE_PROVIDERS__MINIO__CREATE_MISSING_BUCKET=false
```

You can set that only some providers are used by settings `STORAGE_PROVIDERS` value:

```bash
# Only FS and V33 will be used
STORAGE_PROVIDERS=FS,V33
STORAGE_PROVIDERS__FS__NAME=fs
STORAGE_PROVIDERS__V33__NAME=V-33
STORAGE_PROVIDERS__HELLO__NAME=test
STORAGE_PROVIDERS_JSON=`{ "name": "world" }`
```

### JSON Syntax

You can provide all values for a group as a single json by using single underscore.

```bash
# JSON Syntax,
STORAGE_PROVIDERS_HELLO_WORLD=`
{
	"this": "will be treaded",
	"as": "json"
}
```

:::caution

`docker-compose` does not support this syntax.

:::

## Adapters

### Local filesystem

Local adapter will store files on your local filesystem.
If base path is relative, it will put it relatively to project root.
If base path is absolute, it will use that path.

### S3

Zmaj supports any compatible S3 provider. It uses `@aws-sdk/client-s3` under the hood. It requires
access key, secret key, bucket name, region and endpoint.
Example for [Minio](https://min.io/) is provided above.

### Custom adapters

To create custom adapters, extend `BaseStorage` and implement all abstract methods.
For examples, look at `storage-s3` and `storage-core` packages inside monorepo.

<!-- TODO Add more detailed docs -->

```ts
import { BaseStorage } from "@zmaj-js/full"

export class MyStorage extends BaseStorage {
	// Implement missing abstract methods
}

runServer({
	storage: {
		adapters: [MyStorage],
	},
})
```
