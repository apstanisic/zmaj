---
title: Webhooks
---

Zmaj has support for webhooks. They listen for the changes in collections, and call provided URL.
It is possible to configure method, custom headers, and if you want to send changed records.
Webhooks are stored in `zmaj_webhooks` table.

```ts
// Webhook structure
type Webhook = {
	// webhook name
	name: string
	// url that will be called
	url: string
	// events that will trigger webhook
	events: string[]
	// http method that will be used to send webhook
	httpMethod: "POST" | "GET" | "PUT" | "PATCH" | "DELETE"
	// id
	id: string
	// description
	description: string | null
	// is hook enabled
	enabled: boolean
	// headers
	httpHeaders: Record<string, string>
	// should we send changed records (be sure your server supports body object if method is GET)
	sendData: boolean
	// when was hook created
	createdAt: Date
}
```

## Sending data

It is possible to send created/updated/deleted records in webhook. They will be sent as an JSON in
HTTP request body.

```ts
// Type of sent data
type WebhookData = {
	event: string
	data: Record<string, unknown>[]
}
```

## Events

Currently Zmaj supports only CRUD events (events emitted using CrudService).
It also has **experimental** support for changes to users, roles, permissions, webhooks and files.
In the future, it will support additional events (auth events...).

Events format stored in database is "action.resource". For example, to trigger on created post,
Every collection is a resource.
Create posts will be `create.posts`, update comments `update.comments`, delete users `delete.zmajUsers`.
Using system collections is experimental.

## API

### REST API

You can access REST API for webhooks at `/api/system/webhooks`. You can use same
query as CRUD endpoints to paginate and filter results.
When using SDK there is

| Usage                  | Method | URL                      |
| ---------------------- | ------ | ------------------------ |
| Get paginated webhooks | GET    | /api/system/webhooks     |
| Get specific webhook   | GET    | /api/system/webhooks/:id |
| Create webhook         | POST   | /api/system/webhooks     |
| Update webhook         | PUT    | /api/system/webhooks/:id |
| Delete webhook         | DELETE | /api/system/webhooks/:id |

### SDK

You can access API in SDK with `sdk.webhooks`.

```js
await sdk.webhooks.getMany()
```
