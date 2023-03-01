import { SetCollection } from "@api/common/decorators/set-collection.decorator"
import { Controller } from "@nestjs/common"
import { TranslationCollection } from "@zmaj-js/common"
import { TranslationsService } from "./translations.service"

@SetCollection(TranslationCollection)
@Controller("system/translations/:collection")
export class TranslationsController {
	constructor(private service: TranslationsService) {}
}
