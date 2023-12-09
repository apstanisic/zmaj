import { AppNotification } from "@admin-panel/app-layout/app/AppNotification"

export function NoLayoutPage(props: { children: any }) {
	return (
		<>
			{props.children}
			<AppNotification />
		</>
	)
}
