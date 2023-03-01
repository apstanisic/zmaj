import { Global, Module } from "@nestjs/common"
import { PassportModule } from "@nestjs/passport"
import { AccountHackedModule } from "./account-hacked/account-hacked.module"
import { AuthSessionsModule } from "./auth-sessions/auth-sessions.module"
import { AuthenticationConfig } from "./authentication.config"
import { AuthenticationController } from "./authentication.controller"
import { ConfigurableModuleClass } from "./authentication.module-definition"
import { AuthenticationService } from "./authentication.service"
import { EmailChangeModule } from "./email-change/email-change.module"
import { InitializeAdminModule } from "./initialize-admin/initialize-admin.module"
import { UserInvitationsModule } from "./invitations/user-invitations.module"
import { MfaModule } from "./mfa/mfa.module"
import { PasswordResetModule } from "./password-reset/password-reset.module"
import { ProfileModule } from "./profile/profile.module"
import { RefreshTokenService } from "./refresh-token.service"
import { SignUpModule } from "./sign-up/sign-up.module"
import { StrategiesModule } from "./strategies/strategies.module"

@Global()
@Module({
	imports: [
		PassportModule.register({ session: true }),
		InitializeAdminModule,
		AuthSessionsModule,
		ProfileModule,
		PasswordResetModule,
		EmailChangeModule,
		SignUpModule,
		AccountHackedModule,
		UserInvitationsModule,
		StrategiesModule,
		MfaModule,
	],
	providers: [AuthenticationConfig, RefreshTokenService, AuthenticationService],
	exports: [
		AuthenticationService,
		RefreshTokenService,
		AuthenticationConfig, //
	],
	controllers: [AuthenticationController],
})
export class AuthenticationModule extends ConfigurableModuleClass {}
