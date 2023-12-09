import { useGlobalConfigContext } from "@admin-panel/context/global-config-context"
import { Avatar } from "@admin-panel/ui/Avatar"
import { MdOutlineLock } from "react-icons/md"
import { OnlyChildren } from "../../types/OnlyChildren"
import { NoLayoutPage } from "../pages/_NoLayoutPage"

export function AuthPageLayout({ children }: OnlyChildren) {
	const globalConfig = useGlobalConfigContext()

	return (
		<NoLayoutPage>
			<div className="flex h-screen">
				<div
					style={{
						backgroundImage: globalConfig.imageInAuthPages
							? `url(${globalConfig.imageInAuthPages})`
							: "linear-gradient(to top right, #121C84, #8278DA)",
					}}
					className="hidden flex-grow bg-gray-500 bg-cover bg-center bg-no-repeat md:block"
				></div>
				<div className="mx-auto flex h-full max-w-md flex-1 flex-col items-center justify-center px-4 pb-[20vh]">
					<Avatar>
						<MdOutlineLock />
					</Avatar>
					{children}
				</div>
			</div>
		</NoLayoutPage>
	)
}
