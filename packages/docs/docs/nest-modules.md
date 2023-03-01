---
title: NestJS Modules
---

Zmaj is a NestJS app, so you can provide it with modules and services, and you will have access to full
dependency injection (DI), and Zmaj's modules and services.
That means that there is no need for custom extensions and hooks implementation, since you can add custom modules and providers.

## Example

Function `runServer` accepts `customModules` param where you can pass array of all modules that
you want included in the app.

### Custom modules

```ts
import { Injectable, Module } from "@nestjs/common"
import { runServer } from "zmaj"
import { CatsController } from "./cats.controller"
import { CatsService } from "./cats.service"

@Module({
	controllers: [CatsController],
	providers: [CatsService],
})
class MyModule {}

await runServer({
	customModules: [MyModule],
})
```

### Custom providers

If you have simple service that you don't want to create module for, you can pass it to `customProviders`,
Zmaj will create module that holds all providers, and will inject provided services.

```ts
import { runServer, EmailService } from "@zmaj-js/full"
import { Injectable, Module } from "@nestjs/common"

@Injectable()
class MyService {
	constructor(private emailService: EmailService)

	async sendCustomEmail() {
		await this.emailService.sendEmail()
	}
}

runServer({
	customProviders: [MyService],
})
```

## Using Zmaj services

Zmaj exports some services that can be used inside your modules and providers. You can inject them
as standard NestJS providers.

```ts
import { runServer, EmailService } from "zmaj"
import { Injectable, Module } from "@nestjs/common"

@Injectable()
class MyService {
	// injecting EmailService from Zmaj
	constructor(private emailService: EmailService)

	async sendCustomEmail() {
		await this.emailService.sendEmail({
			/* send email params */
		})
	}
}
```

:::note
Not all internal modules and services are exported, in order to limit exposed API.
Internal modules might introduce breaking changes, so please use caution when updating Zmaj packages.
API will be stabilized and standardized before stable release.
:::

## Including Zmaj inside your existing NestJS project

Most of the app logic can be used in `AppModule` and imported in your
existing NestJS application. This does not include admin panel.

:::caution
This feature is not recommended currently, since you will have to manually configure API prefix,
cors, cookies, and listening port.
You must call `AppService`'s `configureApp`, and provide running app.
:::

```ts
import { AppModule } from "zmaj"
import { Module } from "@nestjs/common"

@Module({
	imports: [AppModule],
})
class MyModule {}
```
