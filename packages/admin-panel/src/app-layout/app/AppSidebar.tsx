import { checkSystem } from "@admin-panel/hooks/use-is-allowed"
import { Dialog } from "@admin-panel/ui/Dialog"
import { List } from "@admin-panel/ui/List"
import {
	CollectionDef,
	CollectionMetadataCollection,
	FileCollection,
	RoleCollection,
	UserCollection,
	WebhookCollection,
} from "@zmaj-js/common"
import { clsx } from "clsx"
import { useResourceDefinitions } from "ra-core"
import { memo, ReactNode, useMemo } from "react"
import {
	MdHome,
	MdPermMedia,
	MdPerson,
	MdSchema,
	MdSettings,
	MdSupervisedUserCircle,
	MdViewList,
	MdWeb,
} from "react-icons/md"
import { TbWebhook } from "react-icons/tb"
import { useHref } from "react-router"
import { useGlobalConfigContext } from "../../context/global-config-context"
import { useAuthz } from "../../state/authz-state"
import { useHideDynamicSidebar } from "./use-auto-hide-sidebar"
import { useSidebarOpen } from "./use-sidebar-open"

/**
 * Replaces RA default sidebar
 */
export const Sidebar = memo(() => {
	const [open, setOpen] = useSidebarOpen()
	const hideSidebarDialog = useHideDynamicSidebar()
	// const a = useSdk().collection('posts').getMany()

	return (
		<>
			<nav className="app-sidebar fixed h-[100vh] w-[240px] shrink-0 overflow-y-auto  border-r max-md:hidden">
				<SidebarContent />
			</nav>
			{/* Reserve space since it's sibling is fixed */}
			<div className="w-[240px] max-md:hidden" aria-hidden="true"></div>
			{/*
			For some reason, dialog is not hidden properly when it's not triggered by
			headlessui, so we must add condition here to don't render at all on big screen
			  */}
			{!hideSidebarDialog && (
				<Dialog
					transitionProps={{
						enter: "transition-transform ease-in-out duration-150 transform",
						enterFrom: "-translate-x-full",
						enterTo: "translate-x-0",
						leave: "transition-transform ease-in-out duration-150 transform",
						leaveFrom: "translate-x-0",
						leaveTo: "-translate-x-full",
					}}
					as="nav"
					onClose={setOpen}
					open={open}
					// open={true}
					noStyle
					className={clsx(
						" app-sidebar h-[100vh] w-[240px]  border-r ",
						" mr-auto rounded-none px-0",
						"md:hidden",
						"overflow-y-auto",
					)}
				>
					<SidebarContent />
				</Dialog>
			)}
		</>
	)
})

const SidebarContent = (): JSX.Element => {
	const globalConfig = useGlobalConfigContext()
	const authz = useAuthz()
	const resources = useResourceDefinitions()

	const allowedSections = useMemo(() => {
		return {
			webhooks: checkSystem(authz, "webhooks", "read"),
			users: checkSystem(authz, "users", "read"),
			authz: checkSystem(authz, "authorization", "read"),
			files: checkSystem(authz, "files", "read"),
			infra: checkSystem(authz, "infra", "read"),
			// this check if user is admin
			settings: authz.can("manage", "all"),
		}
	}, [authz])

	const allowedCustomSidebarItems = useMemo(
		() =>
			globalConfig.sidebarItems.filter((item) => {
				if (item.authz === undefined) return true
				return authz.can(item.authz.action, item.authz.resource)
			}),
		[authz, globalConfig.sidebarItems],
	)

	// no need for authz since only allowed returned
	const nonSystemResources = useMemo(() => {
		return (
			Object.values(resources)
				// show only non system resources that have list page
				.filter((resource) => !resource.name.startsWith("zmaj") && resource.hasList)
				// every generated resource should provide collection that was used to generate it
				.filter((res) => {
					const collection: CollectionDef = res.options.collection
					if (
						collection === undefined ||
						collection.disabled ||
						collection.hidden
						// ||
						// collection.isJunctionTable
					) {
						return false
					}
					return true
				})
				.map((resource) => (
					<DrawerItem
						key={resource.name}
						path={resource.name}
						icon={resource.icon}
						label={resource.options.label ?? resource.name}
					/>
				))
		)
	}, [resources])

	return (
		<ul className="du-menu mt-8 w-full overflow-y-auto">
			<DrawerItem path="/" icon={<MdHome />} label="Home" />
			{/*  */}
			{allowedSections.files && (
				<DrawerItem path={FileCollection.collectionName} icon={<MdPermMedia />} label="Files" />
			)}
			{/*  */}
			{allowedSections.users && ( //
				<DrawerItem path={UserCollection.collectionName} icon={<MdPerson />} label="Users" />
			)}
			{/*  */}
			{allowedSections.authz && (
				<DrawerItem
					path={RoleCollection.collectionName}
					icon={<MdSupervisedUserCircle />}
					label="Roles & Permissions"
				/>
			)}
			{/*  */}
			{allowedSections.infra && (
				<DrawerItem
					path={CollectionMetadataCollection.collectionName}
					icon={<MdSchema />}
					label="Collections"
				/>
			)}
			{/*  */}
			{allowedSections.webhooks && (
				<DrawerItem path={WebhookCollection.collectionName} icon={<TbWebhook />} label="Webhooks" />
			)}
			{/*  */}
			{allowedSections.settings && (
				<DrawerItem path="settings" icon={<MdSettings />} label="Settings" />
			)}

			<div className="du-divider my-2"></div>
			{/* <Divider className="my-2" /> */}
			{/*  */}
			{allowedCustomSidebarItems.map((p, i) => (
				<DrawerItem path={p.path} label={p.label} key={"custom_" + i} icon={p.icon ?? <MdWeb />} />
			))}
			{allowedCustomSidebarItems.length > 0 && <div className="du-divider my-2" />}
			{/*  */}
			{nonSystemResources}
		</ul>
	)
}

/**
 * Single row is drawer
 */
const DrawerItem = memo((props: { path: string; icon?: ReactNode; label: string }): JSX.Element => {
	const href = useHref({ pathname: props.path })
	return (
		<List.ButtonItem
			noPadding
			className="py-1 pl-3 pr-1"
			start={props.icon ?? <MdViewList />}
			href={href}
		>
			{props.label}
		</List.ButtonItem>
	)
})
