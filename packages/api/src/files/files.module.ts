import { Module } from "@nestjs/common"
import { FilesContentController } from "./files-content.controller"
import { FilesConfig } from "./files.config"
import { FilesController } from "./files.controller"
import { ConfigurableModuleClass } from "./files.module-definition"
import { FilesService } from "./files.service"
import { ImagesService } from "./images.service"

@Module({
	// imports: [ImagesModule],
	controllers: [FilesController, FilesContentController],
	providers: [FilesService, FilesConfig, ImagesService],
	exports: [FilesService],
})
export class FilesModule extends ConfigurableModuleClass {}
