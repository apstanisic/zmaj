import { DynamicModule, Global, Module, Type } from "@nestjs/common"
import { Class } from "type-fest"

export type CustomModule = Type<any> | DynamicModule
export type CustomProvider = Class<any, any>

@Global()
@Module({})
export class ExternalModule {
	static forRoot(modules: CustomModule[] = [], services: CustomProvider[] = []): DynamicModule {
		return {
			global: true,
			module: ExternalModule,
			imports: modules,
			providers: services,
		}
	}
}
