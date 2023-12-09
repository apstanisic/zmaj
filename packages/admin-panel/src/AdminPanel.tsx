import { CollectionDef } from "@zmaj-js/common"
import { CoreAdmin, useStoreContext } from "ra-core"
import polyglotI18nProvider from "ra-i18n-polyglot"
import englishMessages from "ra-language-english"
import { Fragment, memo, useMemo } from "react"
import { useTimeoutFn } from "react-use"
import { CustomPage, renderCustomPages } from "./app-layout/CustomPage"
import { AppLayout } from "./app-layout/app/AppLayout"
import { useSyncBodyTheme } from "./app-layout/app/use-sync-body-theme"
import { initAuthProvider } from "./auth/auth-provider"
import { authSessionsResource } from "./auth/auth-sessions/AuthSessionsResource"
import { usePublicInfo } from "./auth/hooks/use-public-info"
import { authPages } from "./auth/pages/AuthPages"
import { SignInPage } from "./auth/pages/SignInPage"
import { useSdk } from "./context/sdk-context"
import { Dashboard } from "./dashboard"
import { initDataProvider } from "./data-provider"
import "./field-components"
import { generateResource } from "./generator/generate-resource"
import { useRefetchQueries } from "./hooks/use-refetch-queries"
import { activityLogResource } from "./pages/activity-log/ActivityLogResource"
import { permissionResource } from "./pages/authz/PermissionResource"
import { roleResource } from "./pages/authz/RoleResource"
import { filesResource } from "./pages/files/FilesResource"
import { collectionResource } from "./pages/infra-collections/CollectionResource"
import { fieldResource } from "./pages/infra-fields/FieldResource"
import { relationResource } from "./pages/relations/RelationResource"
import { settingsPage } from "./pages/settings/SettingsPage"
import { usersResource } from "./pages/users/UsersResource"
import { webhookResource } from "./pages/webhooks/WebhookResource"
import { useAuthz } from "./state/authz-state"
import { useInfraState } from "./state/useInfraState"
import { CircularProgress } from "./ui/CircularProgress"

const messages = { en: englishMessages }
const i18nProvider = polyglotI18nProvider(
	(locale) => messages[locale as "en"] ?? englishMessages,
	"en",
)

declare module "ra-core" {
	export interface ResourceOptions {
		collection: CollectionDef
	}
}

/**
 * Maybe define with hooks
 * @see https://github.com/marmelab/react-admin/issues/7623
 */
export function AdminPanel(props: { customPages?: CustomPage[] }) {
	const sdk = useSdk()
	// const client = useQueryClient()
	const store = useStoreContext()
	const refetchQueries = useRefetchQueries()

	const authz = useAuthz()
	const collections = useInfraState()
	const publicAuthInfo = usePublicInfo()

	const authProvider = useMemo(() => {
		return initAuthProvider(sdk, {
			logout: async () => refetchQueries(),
			login: async () => refetchQueries(),
		})
	}, [refetchQueries, sdk])
	const dataProvider = useMemo(() => initDataProvider(sdk, collections.data), [collections, sdk])

	useSyncBodyTheme()

	const resources = useMemo(() => {
		return collections.data
			.filter((c) => !c.tableName.startsWith("zmaj")) //
			.map((c) => generateResource(c, authz))
	}, [collections, authz])

	// react admin requires that <CustomRoutes /> be direct descendent of the <Admin />.
	// so we have to make it as function, and we have to memoize result, since otherwise
	// they are rerendered on every page change
	const appCustomPages = useMemo(
		() =>
			!sdk.auth.isSignedIn ? (
				<>
					{authPages()}
					{/* It shows empty page if there is no resources */}
					{usersResource({ authz })}
				</>
			) : (
				<>
					{authPages()}
					{settingsPage()}
					{/*  */}
					{authSessionsResource()}
					{usersResource({ authz })}
					{roleResource({ authz })}
					{webhookResource({ authz })}
					{permissionResource()}
					{collectionResource({ authz })}
					{fieldResource({ authz })}
					{relationResource({ authz })}
					{filesResource({ authz })}
					{activityLogResource()}
				</>
			),
		[authz, sdk.auth.isSignedIn],
	)
	const userCustomPages = useMemo(
		() => <>{renderCustomPages(props.customPages ?? [])}</>,
		[props.customPages],
	)

	if (!sdk.auth.isSignedIn && !publicAuthInfo.isSuccess) return <Loading />
	if (sdk.auth.isSignedIn && collections.data.length < 1) return <Loading />

	return (
		<CoreAdmin
			i18nProvider={i18nProvider}
			dataProvider={dataProvider}
			authProvider={authProvider}
			disableTelemetry
			store={store}
			title="Zmaj Hello"
			// title={<Title />}
			layout={AppLayout}
			dashboard={Dashboard}
			loginPage={SignInPage}
			requireAuth
			// prevents empty page to be shown, just in case
			ready={Fragment}
		>
			{appCustomPages}
			{userCustomPages}
			{resources}
		</CoreAdmin>
	)
}
const Loading = memo(() => {
	const sdk = useSdk()
	// if after 20 seconds page is not showing, sign user out and reload the page
	// there should be something better, TODO
	useTimeoutFn(async () => {
		// if (sdk.auth.isSignedIn) {
		// 	await sdk.auth.signOut().catch(() => {})
		// }
		location.reload()
	}, 10000)

	return (
		<div className="center fixed inset-0 bg-neutral">
			<CircularProgress thickness={20} size="min(200px, 70vw)" className="text-white" />
		</div>
	)
})
