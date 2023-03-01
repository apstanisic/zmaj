import { Global, Module } from "@nestjs/common"
import { CrudBaseService } from "./crud-base.service"
import { CrudCreateService } from "./crud-create.service"
import { CrudDeleteService } from "./crud-delete.service"
import { CrudReadJoinService } from "./crud-read-join.service"
import { CrudReadService } from "./crud-read.service"
import { CrudUpdateService } from "./crud-update.service"
import { CrudValidationModule } from "./crud-validation/crud-validation.module"
import { CrudWithRelationsService } from "./crud-with-relations.service"
import { CrudConfig } from "./crud.config"
import { ConfigurableModuleClass } from "./crud.module-definition"
import { CrudService } from "./crud.service"

@Global()
@Module({
	imports: [CrudValidationModule],
	providers: [
		CrudBaseService,
		CrudWithRelationsService,
		CrudService,
		CrudReadService,
		CrudReadJoinService,
		CrudUpdateService,
		CrudCreateService,
		CrudDeleteService,
		CrudConfig,
	],
	exports: [
		CrudBaseService,
		CrudWithRelationsService,
		CrudService,
		CrudReadService,
		CrudUpdateService,
		CrudCreateService,
		CrudDeleteService,
		CrudConfig,
	],
})
export class CrudModule extends ConfigurableModuleClass {}
