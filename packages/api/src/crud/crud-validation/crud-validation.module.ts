import { Module } from "@nestjs/common"
import { CrudValidationListener } from "./crud-validation.listener"

@Module({
	providers: [CrudValidationListener],
})
export class CrudValidationModule {}
