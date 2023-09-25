import { InitializeAdminService } from "@api/authentication/initialize-admin/initialize-admin.service"
import { BootstrapRepoManager } from "@api/database/BootstrapRepoManager"
import { OnInfraChangeService } from "@api/infra/on-infra-change.service"
import { RelationsService } from "@api/infra/relations/relations.service"
import { Injectable } from "@nestjs/common"
import {
	CollectionMetadataModel,
	FieldMetadataModel,
	RelationMetadataModel,
	RelationUpdateDto,
	UserModel,
} from "@zmaj-js/common"
import { SequelizeService } from "@zmaj-js/orm-sq"
import { TComment, TPost, TPostInfo } from "@zmaj-js/test-utils"
import { BuildTestDbService } from "./build-test-db.service"

@Injectable()
export class TestingUtilsService {
	private testData: BuildTestDbService
	constructor(
		private onChange: OnInfraChangeService,
		private repoManager: BootstrapRepoManager,
		private relationsService: RelationsService,
		private adminInit: InitializeAdminService,
		private sqService: SequelizeService,
	) {
		this.testData = new BuildTestDbService(this.sqService)
	}

	async createTestAdmin(): Promise<void> {
		// delete if exist
		await this.repoManager.getRepo(UserModel).deleteWhere({ where: { email: "admin@example.com" } })
		await this.adminInit.createAdmin({
			email: "admin@example.com",
			firstName: "Test",
			lastName: "Admin",
			password: "password",
		})
	}

	async seedTestData(): Promise<void> {
		await this.testData.seedRandomData()
	}

	/**
	 *
	 */
	async configureExampleProjectForAdminPanel(): Promise<void> {
		const repo = this.repoManager.getRepo(FieldMetadataModel)
		const repoCol = this.repoManager.getRepo(CollectionMetadataModel)
		const repoRel = this.repoManager.getRepo(RelationMetadataModel)

		// posts

		await repoCol.updateWhere({
			where: { tableName: "posts" },
			changes: { displayTemplate: "{title}" },
		})
		await repo.updateWhere({
			where: { tableName: "posts", columnName: "likes" as keyof TPost },
			changes: { componentName: "int" },
		})
		await repoRel.updateWhere({
			where: { tableName: "posts", propertyName: "postsTags" },
			changes: new RelationUpdateDto({ propertyName: "tags", label: "Tags" }),
		})
		await repo.updateWhere({
			where: { tableName: "posts", columnName: "body" },
			changes: { componentName: "long-text" },
		})

		// comments
		await repoCol.updateWhere({
			where: { tableName: "comments" },
			changes: { displayTemplate: "{body}" },
		})
		await repo.updateWhere({
			where: { tableName: "comments", columnName: "body" as keyof TComment },
			changes: { componentName: "markdown" },
		})

		// tags
		await repoCol.updateWhere({
			where: { tableName: "tags" },
			changes: { displayTemplate: "{name}" },
		})

		// post_info
		await repo.updateWhere({
			where: { tableName: "post_info", columnName: "additionalInfo" as keyof TPostInfo },
			changes: { componentName: "key-value" },
		})

		// posts_tags
		await repoRel.updateWhere({
			where: { tableName: "tags", propertyName: "postsTags" },
			changes: new RelationUpdateDto({ propertyName: "posts", label: "Posts" }),
		})

		await repoRel.updateWhere({
			where: { tableName: "posts", propertyName: "postsTags" },
			changes: new RelationUpdateDto({ propertyName: "tags", label: "Tags" }),
		})
		await this.relationsService.joinManyToMany("postsTags")
	}

	async dropUserTables(): Promise<void> {
		this.onChange.executeChange(async () => this.testData.dropAllNonSystemTables())
	}
	async createSystemTables(): Promise<void> {
		await this.testData.createSystemTables()
	}
	async dropSystemTables(): Promise<void> {
		await this.testData.dropSystemTables()
	}
}
