/**
 * Error messages
 *
 * This errors can be improved gradually
 */
export const emsg = {
	invalidPayload: "You sent invalid payload",
	invalidPayloadKey: (key: string) => `You sent invalid payload for '${key}'` as const,
	emptyPayload: "You sent empty payload",
	// db/crud
	invalidSort: (key?: string) =>
		key ? (`You can't sort by '${key}'` as const) : ("Invalid sort" as const),
	dbProblem: "Problem with DB",
	uniqueExists: (field: string, value?: any) => {
		const base =
			`You can't create record since there is already record with field '${field}'` as const
		return value === undefined ? base : (`${base} and value '${JSON.stringify(value)}'` as const)
	},
	recordNotFound: "Record not found",
	notFound: (type?: string) => `${type ?? "Record"} not found` as const,
	cantDeleteHasFk: "Record can't be deleted since FK points to it",
	cantDeleteTableHasFk: "You can't delete table that has FK pointing at it",
	noModel: (model: string) => `Model '${model}' does not exist` as const,
	noProperty: "Property does not exist",
	notUuid: "Value must be uuid",
	invalidQuery: "Invalid query",
	invalidQueryKey: (key: string) => `You sent invalid query for '${key}'` as const,
	tableHasOnlyPk: "Table does not have any non ID fields",
	noId: "ID is not provided",
	// mfa
	mfaInvalid: "Invalid 2FA token",
	mfaDisabled: "You do not have 2FA enabled",
	mfaEnabled: "You already have 2FA enabled",
	mfaEmailExpired: "Email to enable 2FA has expired",
	// oauth
	// oauthNotEnabled: (provider: string) => `${provider} oauth is not enabled`,
	oauthNotEnabled: `URL does not exist`,
	// auth
	invalidIp: "Invalid IP",
	userNotFound: "User does not exists",
	emailUnconfirmed: "Email unconfirmed. Please check your emails to verify email",
	rtNotProvided: "Refresh token not provided",
	invalidEmailOrPassword: "Invalid email or password",
	invalidPassword: "Invalid password",
	emailTokenExpired: "Email sent to you is expired",
	authRequired: "You must be authenticated",
	accountDisabled: "Your account is not active",
	jwtInvalid: "Invalid authentication",
	noAuthz: "You do not have permission for this action",
	cantDeleteLastAdmin: "You can't delete last admin",
	oauthSignUpDisabled: "You are not allowed to register with external provider",
	alreadySignedIn: "You are already signed in",
	notSignedIn: "You are not signed in",
	// config
	settingsReadonly: "You can't change this setting",

	// authz
	requiredRole: "You can't delete this role",
	// infra
	noRelation: "Relation does not exist",
	noField: "Field does not exist",
	noCollection: "Collection does not exists",
	noPk: (table: string) => `Table '${table}' does not have primary key` as const,
	notMtmRelation: "Relation is not many to many",
	isSystemTable: "You can't modify system table",
	noDeletePk: "You can't delete primary key",
	noDeleteFk: "Delete foreign key before deleting this field",
	noDefaultValue:
		"Must provide default value to a non nullable column, since records already exist",
	cantSetUnique: "Column can't be unique, cause there are multiple rows with same value",
	cantSetNull: "Column can't be required, since there are null values in some rows",
	//
	collectionExists: (col: string) => `Collection '${col}' already exists` as const,
	fieldExists: (field: string) => `Field '${field}' already exists` as const,
	propertyTaken: (property: string) => `Property '${property}' already exist` as const,
	mtmJoinInvalid: "It's not possible to join relations",
	mtmSplitInvalid: "There is no many-to-many relation",
	// validation
	notEmail: (val: unknown) => `Value '${JSON.stringify(val)}' is not valid email`,
	badEncryptionValue: `Value is corrupted`,
	// file
	uploadDisabled: "Upload is disabled for this provider",
	uploadProblem: "Problem uploading file",
	// images
	noImageSize: (size: string) => `Image size '${size}' does not exist` as const,
	fileNotImage: `File is not an image`,
	badFileField: `Set file as 'file' property`,
} as const
