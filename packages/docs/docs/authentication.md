---
title: Authentication
---

Zmaj provides multiple way to sign-in/sign-up. It provides sane defaults with ability to customize behavior.
All user information is stored in `zmaj_users` table.

## Authentication Types

### Email and password

Zmaj supports standard sign in with email and password.
It will create short-lived access token and long-lived refresh token.
If you are using client SDK or admin panel, access tokens will be refreshed automatically when they expire.

### Link sent to email

Zmaj supports signing in with sending custom link to email. User will receive email with link
that can be used to sign in. Link is valid for 5 minutes.
This feature requires that there is working email provider.
It uses `passport-magic-login` package under the hood.

### Basic Auth

Zmaj supports [basic auth](https://en.wikipedia.org/wiki/Basic_access_authentication).
Basic Auth is disabled by default, and can be enabled by passing `allowBasicAuth: true`, to authentication config
object.
If user has 2FA enabled, Zmaj will throw an exception.

### OAuth

Zmaj has **experimental** support for `google` and `facebook` as OAuth providers.
You can pass params directly to `runServer` or provide them as env variables.
By default, sign up using OAuth is allowed, to disable it, pass `allowOAuthSignUp: true` to authentication
config object. If `allowSignUp` is `false`, `allowOAuthSignUp` is ignored.

Example of env values:

```bash
GOOGLE_OAUTH_CLIENT_ID=id_google
GOOGLE_OAUTH_CLIENT_SECRET=google_secret
FACEBOOK_OAUTH_CLIENT_ID=id_facebook
FACEBOOK_OAUTH_CLIENT_SECRET=fb_secret
```

<!-- ### OIDC

Zmaj has **experimental** support for OpenID Connect.
It uses [openid-client](https://github.com/panva/node-openid-client) under the hood.
You can pass providers either as env variables or directly to `runServer`.

Example OIDC providers. It uses same type of specifying multiple groups as storage providers:

```bash
OIDC_PROVIDERS=MY_DOMAIN,HELLO
#
OIDC_PROVIDERS__HELLO__NAME=ProviderHello
OIDC_PROVIDERS__HELLO__CLIENT_ID=some-id
OIDC_PROVIDERS__HELLO__CLIENT_SECRET=some-secret
OIDC_PROVIDERS__HELLO__ENABLED=true
#
OIDC_PROVIDERS__MY_DOMAIN__NAME=MY_DOMAIN_1
OIDC_PROVIDERS__MY_DOMAIN__CLIENT_ID=some-id
OIDC_PROVIDERS__MY_DOMAIN__CLIENT_SECRET=some-secret
OIDC_PROVIDERS__MY_DOMAIN__ENABLED=false
``` -->

## Signing Up

To allow users to sign up, you can set `allowSignUp: true` in authentication config.

If you want to change that value during runtime, set `allowSignUp: "dynamic"`.
That will allow you to change value in admin panel. If signing up is not allowed `allowOAuthSignUp` is ignored.

## Security

Zmaj uses `argon2` for hashing passwords. Password will be hashed first, and then encrypted with `secretKey`.
Read more about encrypting password [here](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#peppering).

<!-- You can disable encrypting password, by passing `encryptPasswordHash: false` to authentication config,
but it's not recommended. -->

If for some reason you need access to password hashes, you can get it by decrypting passwords with `EncryptionService.decrypt`.

## Example configuration

```ts
import ms from "ms"
import { runServer } from "zmaj"

// all values are optional
await runServer({
	authentication: {
		/**
		 * Can user sign up.
		 * - true: User is allowed to sign up
		 * - false: User is not allowed to sign up
		 * - "dynamic": Value can be changed during runtime
		 * Defaults to `"dynamic"`.
		 */
		allowSignUp: "dynamic",
		/** How long does refresh token lives in ms. Defaults to `30d`.*/
		refreshTokenTtlMs: ms("30d"),
		/** How long does access token lives in ms. Defaults to `20m`. */
		accessTokenTtlMs: ms("20m"),
		/**
		 * Where to redirect after oauth/magic-link sign in.
		 * If it's full url (http*), it will use that, otherwise prepend admin panel url
		 * That way it's possible to use api without admin panel
		 * Default to predefined page in admin panel
		 */
		signInRedirectPath: "#/my-custom-redirect-page-on-admin-panel",
		/** Can user authenticate with basic auth. Defaults to `false`. */
		allowBasicAuth: false,
		/**
		 * Should we allow jwt access token to be passed as query param.
		 * Currently, it's used for getting images with auth in admin panel, but in the future it should be done
		 * with service worker. It's required to be true for admin panel to show restricted images
		 * Defaults to `true`.
		 */
		allowJwtInQuery: true,
		/**
		 * How can user reset password
		 * There are 2 options, to send reset email which requires working email provider, and forbidden
		 * Defaults to `reset-email`.
		 */
		passwordReset: "reset-email",
		/**
		 * Can user sign up using OAuth, or they can only sign in if they already have account.
		 * If sign up is disabled, this option is ignored.
		 * Defaults to `true`
		 */
		allowOAuthSignUp: true,
		/** Should we require that email be verified before user can sign in. Defaults to `true`. */
		requireEmailConfirmation: true,
		/**
		 * OAuth providers
		 * Google and Facebook are currently available.
		 * Apple will be added in the future
		 */
		oauth: {
			google: {
				clientId: "my_id",
				clientSecret: "secret",
				enabled: true,
			},
			facebook: {
				clientId: "my_id",
				clientSecret: "secret",
				enabled: true,
			},
		},
	},
})
```
