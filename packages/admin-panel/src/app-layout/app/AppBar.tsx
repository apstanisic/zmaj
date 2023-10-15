import { useIsAllowedSystem } from "@admin-panel/hooks/use-is-allowed"
import { CircularProgress } from "@admin-panel/ui/CircularProgress"
import { Menu } from "@admin-panel/ui/Menu"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { useIsFetching } from "@tanstack/react-query"
import { clsx } from "clsx"
import { useLoading, useLogout, useRedirect } from "ra-core"
import { memo, useMemo } from "react"
import { MdOutlinePerson, MdPerson, MdPowerSettingsNew } from "react-icons/md"
// import { useIsFetching as useIsFetchingRa } from "react-query"
import { useGlobalConfigContext } from "../../context/global-config-context"
import { RefreshButton } from "../buttons/RefreshButton"
import { useTheme } from "../use-theme"
import { ToggleSidebar } from "./ToggleSidebar"
import { ToggleThemeButton } from "./ToggleThemeButton"

export const AppBar = memo((props: { widthCss: string; heightCss: string }) => {
	const global = useGlobalConfigContext()
	// const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const logout = useLogout()
	const [theme] = useTheme()
	const redirect = useRedirect()
	const fetchingZmaj = useIsFetching()
	const fetchingRa = useLoading()

	const fetching = useMemo(() => fetchingZmaj > 0 || fetchingRa, [fetchingZmaj, fetchingRa])
	const canAccessProfile = useIsAllowedSystem("account", "readProfile")

	return (
		<header
			className={clsx(
				"du-navbar fixed right-0 top-0 z-50 bg-primary px-3",
				props.heightCss,
				props.widthCss,
				theme === "light" && "text-white",
			)}
		>
			<div className="du-navbar-start">
				<ToggleSidebar />

				{/* Header */}
				<h1 className="ml-2 mr-auto whitespace-nowrap text-xl tracking-wider max-sm:invisible">
					{global.appName}
				</h1>
			</div>
			<div className="du-navbar-end">
				{fetching && <CircularProgress size="24px" thickness={4} className="mr-3" />}

				{/* Toggle Theme */}
				<ToggleThemeButton />

				{/* Refresh */}
				<RefreshButton />

				<Menu
					button={(ref, props) => {
						return (
							<IconButton
								size="large"
								{...props}
								aria-label="More Actions"
								onPress={() => ref?.current?.click()}
							>
								<MdPerson />
							</IconButton>
						)
					}}
					items={[
						...(canAccessProfile
							? [{ title: "Profile", startIcon: <MdOutlinePerson />, to: "/profile" }]
							: []),
						{
							button: true,
							title: "Logout",
							startIcon: <MdPowerSettingsNew />,
							onClick: async () => {
								redirect("/")
								return logout()
							},
						},
					]}
				/>
			</div>
		</header>
	)
})
