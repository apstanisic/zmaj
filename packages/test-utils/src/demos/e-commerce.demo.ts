import {
	randNumber,
	randParagraph,
	randProductAdjective,
	randProductCategory,
	randProductDescription,
	randProductName,
} from "@ngneat/falso"
import { Role, times } from "@zmaj-js/common"
import { draw, random, unique } from "radash"
import { v4 } from "uuid"
import { UserStub } from "../stubs/user.stub.js"
import { RoleStub } from "../stubs/role.stub.js"

type Category = {
	id: string
	name: string
}
type TagProduct = {
	id?: number
	tagId: string
	productId: string
}

type Review = {
	id: string
	productId: string
	userId: string
	review: string
}

type Order = {
	id: string
	status: string
	userId: string
	discount: number
	totalPrice: number
}

type OrderProduct = {
	id: string
	orderId: string
	productId: string
	totalPrice: number
	amount: number
}

type Tag = {
	id: string
	name: string
}

type Product = {
	id: string
	name: string
	price: number
	description: string
	categoryId: string
	fileId: string | null
}
const roles: Role[] = [RoleStub({ name: "Shopper", description: "User can shop in here" })]

const users = unique(
	times(10, () => UserStub({ roleId: draw(roles)!.id })),
	(u) => u.email,
)

const tags = unique(
	times(10, () => randProductAdjective()),
	(v) => v,
).map((name): Tag => ({ name, id: v4() }))

const categories = unique(
	times(15, () => randProductCategory()),
	(v) => v,
).map((name): Category => ({ name, id: v4() }))

const products = times(
	40,
	(i): Product => ({
		name: randProductName(),
		categoryId: draw(categories)!.id,
		description: randProductDescription(),
		id: v4(),
		price: randNumber({ min: 1, max: 1000 }) * 100,
		fileId: null,
	}),
)

const reviews = unique(
	times(
		100,
		(i): Review => ({
			id: v4(),
			productId: draw(products)!.id,
			review: randParagraph(),
			userId: draw(users)!.id,
		}),
	),
	// ensure only 1 review per user per product
	(r) => `${r.userId}${r.productId}`,
)

const orders = times(
	50,
	(i): Order => ({
		id: v4(),
		userId: draw(users)!.id,
		status: draw(["pending", "sent", "delivered"])!,
		discount: random(0, 9) * 10,
		totalPrice: random(10, 10000),
	}),
)

const orderProducts = unique(
	orders.flatMap((order): OrderProduct[] =>
		times(5, (i) => ({
			id: v4(),
			amount: randNumber({ min: 1, max: 3 }),
			orderId: order.id,
			productId: draw(products)!.id,
			totalPrice: randNumber({ min: 5, max: 500 }) * 10,
		})),
	),
	// prevent 2 products in same order
	(op) => op.orderId + op.productId,
)

const productTags = unique(
	products.flatMap((p) =>
		times(3, (i): TagProduct => ({ productId: p.id, tagId: draw(tags)!.id })),
	),
	(pt) => pt.productId + pt.tagId,
)

export const eCommerceDemo = {
	users,
	roles,
	products,
	categories,
	tags,
	orders,
	orderProducts,
	reviews,
	productTags,
}
