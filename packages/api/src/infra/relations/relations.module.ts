import { Global, Module } from "@nestjs/common"
import { CreateManyToManyRelationsService } from "./create-many-to-many-relations.service"
import { DirectRelationService } from "./direct-relations.service"
import { RelationsController } from "./relations.controller"
import { RelationsService } from "./relations.service"
import { ManyToManyRelationsService } from "./many-to-many-relations.service"

@Global()
@Module({
	controllers: [RelationsController],
	providers: [
		RelationsService,
		ManyToManyRelationsService,
		CreateManyToManyRelationsService,
		DirectRelationService,
		// RelationMigrationCommandsService,
	],
	exports: [RelationsService,],
})
export class RelationsModule {}
