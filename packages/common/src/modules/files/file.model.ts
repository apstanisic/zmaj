import { BaseModel, ModelType } from "@zmaj-js/orm-common"
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
		name: f.text({ nullable: true }),

		/**
		 * File extensions.
		 * It is possible for file to not have extension, then it's null //it's then empty string
		 * It should not contain leading dot `"."`
		 */
		extension: f.text({ nullable: true, canUpdate: false }),

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
		uri: f.text({ canUpdate: false }),

		/**
		 * Storage name that is used. config for storage is in .env
		 */
		storageProvider: f.text({ canUpdate: false }),
	}))

	user = this.manyToOne(() => UserModel, { fkField: "userId" })
}

export type FileInfo = ModelType<FileModel>
// /**
//  * File
//  *
//  * `File` is already a class in JS, so I added info (since this is info about file)
//  */
// export type FileInfo = {
// 	/**
// 	 * File ID
// 	 */
// 	id: string

// 	/**
// 	 * When is file created
// 	 */
// 	createdAt: Date

// 	/**
// 	 * Name. Without path, without extension Example: `test-image`
// 	 */
// 	name: string | null

// 	/**
// 	 * File extensions.
// 	 * It is possible for file to not have extension, then it's null //it's then empty string
// 	 * It should not contain leading dot `"."`
// 	 */
// 	extension: string | null

// 	/**
// 	 * Use as alt text in browser
// 	 */
// 	description: string | null

// 	/**
// 	 * Owner. It's possible to have file without owner
// 	 */
// 	userId: string | null

// 	/**
// 	 * Folder
// 	 * It currently does nothing, but it will be used to display nested folders
// 	 * It should have it's own permissions (public can access only where folder 'Public'...)
// 	 */
// 	folderPath: string

// 	/**
// 	 * Mime type (image/png, text/plain)
// 	 */
// 	mimeType: string

// 	/**
// 	 * File size in bytes
// 	 */
// 	fileSize: number

// 	/**
// 	 * Path where file is stored. This is provider specific.
// 	 * It's not public url, it's path for provider service to access
// 	 */
// 	uri: string

// 	/**
// 	 * Storage name that is used. config for storage is in .env
// 	 */
// 	storageProvider: string

// 	/**
// 	 * User relation that is owner
// 	 */
// 	user?: EntityRef<User>

// 	/**
// 	 * If file is image, we will generate images of different sizes
// 	 */
// 	// images?: EntityRef<ImageInfo>[]
// }
