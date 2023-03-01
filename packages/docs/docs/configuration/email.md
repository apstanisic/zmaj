---
title: Email
description: Email configuration (optional)
---

Email is not required, but highly recommended.
It is needed if you want to send emails to reset passwords, confirm email, invite users and confirm changed email.

Zmaj uses `nodemailer` for sending emails.

## Configuring

```js
import { runServer } from "zmaj"
// Example email configuration. All values are optional
await runServer({
	email: {
		/** Is email enabled. You can manually disable email */
		enabled: true,
		/** Email user */
		user: "username",
		/** Email password */
		password: "password",
		/** Email host. There are free inbox for testing at https://ethereal.email/ */
		host: "smtp.ethereal.email",
		/** Email port */
		port: 587,
		/**
		 * Should we use TLS
		 * @see https://nodemailer.com/smtp/#tls-options
		 */
		secure: false,
	},
})
```

### Env values

Zmaj supports providing email configuration with env variables. If values are provided both hardcoded via code,
and via env, code values will be used.

Example:

```bash
# Defaults to false
EMAIL_ENABLED=true
# Values bellow are required if EMAIL_ENABLED=true
EMAIL_USER=noreply@example.com
EMAIL_PASSWORD=password
EMAIL_HOST=localhost
EMAIL_PORT=1025
# Always optional
EMAIL_SECURE=false
```

## Email provider during development

If you need provider while developing, there is [mailhog](https://hub.docker.com/r/mailhog/mailhog/) docker container.
If you can't use docker, see [ethereal](https://ethereal.email/), they provide fake email service.
