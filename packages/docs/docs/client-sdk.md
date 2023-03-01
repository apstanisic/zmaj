---
title: Client SDK
---

Zmaj comes with client SDK that can be used to consume API in easy and type-safe way. This SDK is
used in the admin panel, so everything that can be done within panel, can be done with SDK.
SDK is written in Typescript, so there are autosuggestions and types for every API.

SDK works fully in browser environment. In NodeJS, it's currently not possible to upload/download files.

## Usage

### Installing

```bash
npm install @zmaj-js/client-sdk
```

### Usage Examples

#### Create client

```js
const sdk = new ZmajSdk({ url: "http://localhost:5000/api" })
```

#### Get Records

```js
const result = await sdk.collections("posts").getMany()
// will print all posts (default limit is 20)
console.log(result.data)
```

#### Create record

```js
const createdPost = await sdk.collections("posts").createOne({ data: { title: "hello" } })
```

#### Sign in

```js
const authUser = await sdk.auth.signIn({ email: "test@example.com", password: "password" })
// Returns special auth user object
console.log(authUser.email)
```

#### Download file

```js
const fileBlob = await sdk.files.download({ id: "file-uuid" })
```

#### Delete Webhook

```js
const deletedWebhook = await sdk.webhook.deleteById({ id: "hook-uuid" })
```

### Multiple connections

Zmaj stores access token in `localStorage`. If you want to have multiple different connections, you
need to provide name to every instance. That name will be used to namespace saved data.

```js
const sdk1 = new ZmajSdk({ url: "some-url", name: "sdk1" })
const sdk2 = new ZmajSdk({ url: "some-other-url", name: "sdk2" })
```
