---
title: Files
---

Zmaj supports uploading and downloading files. Files can be stored on local filesystem, S3 bucket,
or in any place you provide adapter for.
Zmaj handles files as streams (using [busboy](https://github.com/mscdex/busboy) and [pechkin](https://github.com/rafasofizada/pechkin) under the hood),
that way no data is stored in memory and file upload will work with servers with small amount of RAM.

## Configuring

```js
await runServer({
	files: {
		// will generate "thumbnail" and "original" size
		generateCommonImageSizes: true,
		// example when you want to limit to 10mb, by default it's 50mb
		maxUploadSize: 1024 * 1024 * 10,
		// this will generate image, which limit is FullHD
		imageSizes: [
			{
				name: "fullHd",
				height: 1080,
				width: 1920,
			},
		],
	},
})
```

### Max file size

By default, maximum file size is 50MB, but this option can be changed by passing custom size in bytes `maxUploadSize`.

### Custom image sizes

You can define custom sizes for image to be generated. This sizes can be accessed by passing
`?size=my-size-name` in URL when getting image.
See what each option mean at [sharp docs](https://sharp.pixelplumbing.com/api-resize).
Zmaj will check if uploaded file is image in supported format, and generate all specified sizes.
Currently it's only possible to provide sizes trough `runServer` config, and not with the admin panel.

```js
await runServer({
	files: {
		imageSizes: [
			{
				// only name is required
				name: "fullHd",
				height: 1080,
				width: 1920,
				shouldEnlarge: false,
				fit: "inside",
			},
		],
	},
})
```

## Downloading file

You can download file by sending `GET` request to `/api/files/file-id/content`. If you need access token to access
image, you can provide access token either as a `Authorization` header, or as query params `?accessToken=some-jwt`.
Zmaj allows setting access token as query param since when using image inside `img` tag, we can't set headers.

## API

### REST API

You can access REST API for files at `/api/files`. You can use same
query as CRUD endpoints to paginate and filter results.

| Usage                  | Method | URL                    |
| ---------------------- | ------ | ---------------------- |
| Get paginated files    | GET    | /api/files             |
| Get specific file info | GET    | /api/files/:id         |
| Get file content       | GET    | /api/files/:id/content |
| Update file info       | PUT    | /api/files/:id         |
| Delete file            | DELETE | /api/files/:id         |
| Upload file            | POST   | /api/files             |

### SDK

You can access API in SDK with `sdk.files`. This will return all possible methods.

```js
await sdk.files.getMany()
await sdk.files.upload(uploadParams)
```
