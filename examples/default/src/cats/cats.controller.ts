import { Controller, Get, NotFoundException, Param, ParseIntPipe, Post } from "@nestjs/common"
import { DtoBody } from "zmaj"
import { CatsService } from "./cats.service"
import { Cat } from "./cats.type"
import { CreateCatDto } from "./create-cat.dto"

@Controller("cats")
export class CatsController {
	constructor(private service: CatsService) {}

	@Get(":id")
	getCat(@Param("id", ParseIntPipe) id: number): Cat {
		const cat = this.service.getCat(id)
		if (!cat) throw new NotFoundException("Cat does not exist")
		return cat
	}

	@Get()
	getCats(): Cat[] {
		return this.service.getCats()
	}

	@Post()
	createCat(@DtoBody(CreateCatDto) body: CreateCatDto): Cat {
		return this.service.createCat(body)
	}
}
