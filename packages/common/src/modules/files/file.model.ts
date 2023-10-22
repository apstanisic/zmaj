import { BaseModel, GetModelFields } from "@zmaj-js/orm"
import { UserModel } from "../users/user.model"

export class FileModel extends BaseModel {
	override name = "zmajFiles"
	override tableName = "zmaj_files"

	override fields = this.buildFields((f) => ({
		/**
		 * File ID
		 */
		id: f.uuid({ isPk: true }),

		/**
		 * When is file created
		 */
		createdAt: f.createdAt({}),

		/**
		 * Name. Without path, without extension Example: `test-image`
		 */
		name: f.text({}),

		/**
		 * File extensions.
		 * It is possible for file to not have extension, then it's null //it's then empty string
		 * It should not contain leading dot `"."`
		 */
		// extension: f.text({ nullable: true, canUpdate: false }),

		/**
		 * Use as alt text in browser
		 */
		description: f.text({ nullable: true }),

		/**
		 * Owner. It's possible to have file without owner
		 */
		userId: f.uuid({ nullable: true }),

		/**
		 * Folder
		 * It currently does nothing, but it will be used to display nested folders
		 * It should have it's own permissions (public can access only where folder 'Public'...)
		 */
		folderPath: f.text({}),

		/**
		 * Mime type (image/png, text/plain)
		 */
		mimeType: f.text({ canUpdate: false }),

		/**
		 * File size in bytes
		 */
		fileSize: f.int({ canUpdate: false }),

		/**
		 * Path where file is stored. This is provider specific.
		 * It's not public url, it's path for provider service to access
		 */
		uri: f.text({ canUpdate: false, canRead: false }),

		/**
		 * Storage name that is used. config for storage is in .env
		 */
		storageProvider: f.text({ canUpdate: false, canRead: false }),
	}))

	user = this.manyToOne(() => UserModel, { fkField: "userId" })
}

export type FileInfo = GetModelFields<FileModel>
