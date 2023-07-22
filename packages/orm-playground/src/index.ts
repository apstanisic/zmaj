import { UserModel, systemModels } from "@zmaj-js/common"
import { DatabaseConfig, SequelizeService } from "@zmaj-js/orm"

const service = new SequelizeService(
	new DatabaseConfig({
		database: "dev_database",
		host: "localhost",
		password: "db_password",
		username: "db_user",
		port: 5432,
	}),
)

async function run() {
	console.log("here")

	await service.init([...systemModels])
	console.log("here!!")
	const userRepo = service.repoManager.getRepo(UserModel)
	const user = await userRepo.findOne({
		where: {
			email: { $ne: "hello@world.test" },
			lastName: { $nin: ["John", "Smith"] },
		},
		fields: {
			email: true,
			id: true,
			files: {
				id: true,
				fileSize: true,
				name: true,
			},
		},
	})
	console.log({ user })
}

run()
