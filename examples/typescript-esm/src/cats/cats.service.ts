import { Injectable } from "@nestjs/common"
import type { Cat } from "./cats.type.js"
import { CreateCatDto } from "./create-cat.dto.js"

@Injectable()
export class CatsService {
	private cats = [
		{ id: 1, name: "John" },
		{ id: 2, name: "Mark" },
		{ id: 3, name: "Elvis" },
		{ id: 4, name: "Meow" },
	]

	getCats(): Cat[] {
		return this.cats
	}

	getCat(id: number): Cat | undefined {
		return this.cats.find((cat) => cat.id === id)
	}

	createCat(data: CreateCatDto): Cat {
		const cat: Cat = {
			name: data.name,
			id: this.cats.length + 1,
		}
		this.cats.push(cat)
		return cat
	}
}
