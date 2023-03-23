import { EncryptionModule } from "@api/encryption/encryption.module"
import { DynamicModule, Module } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { UserCreateDto } from "@zmaj-js/common"
import { CliDbModule } from "./bootstrap-cli-db"
import { UsersService } from "@api/users/users.service"

@Module({})
class CliCreateAdminModule {
	static forRoot(envPath: string): DynamicModule {
		return {
			module: CliCreateAdminModule,
			global: true,
			imports: [CliDbModule.forRoot(envPath), EncryptionModule],
			providers: [UsersService],
		}
	}
}
/**
 * This enables us to run migrations without bootstraping the whole app.
 * It also enables us to run migrations even if app is in invalid state.
 */
export async function createAdminCli(envPath: string, data: UserCreateDto): Promise<void> {
	const app = await NestFactory.create(CliCreateAdminModule.forRoot(envPath), { logger: ["error"] })
	app.enableShutdownHooks()
	try {
		await app.get(UsersService).createUser({ data })
	} finally {
		await app.close()
	}
}
