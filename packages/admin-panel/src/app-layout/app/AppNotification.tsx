import { Notification } from "@admin-panel/ui/Notification"
import { NotificationPayload, useNotificationContext, useTranslate } from "ra-core"
import { isString } from "radash"
import { ReactNode, useCallback, useEffect, useState } from "react"
import { useTimeoutFn } from "react-use"

function NotificationGroup(props: { children: ReactNode }) {
	return (
		<div className=" fixed bottom-4 right-4 z-50 flex flex-col gap-y-3">{props.children}</div>
	)
}

/**
 * Replaces RA default notification
 *
 * Based from React-admin:
 * // packages/ra-ui-materialui/src/layout/Notification.tsx
 */
export function AppNotification() {
	const { notifications, takeNotification } = useNotificationContext()
	// const [theme] = useTheme()
	const translate = useTranslate()
	const [open, setOpen] = useState(false)
	const [messageInfo, setMessageInfo] = useState<NotificationPayload | undefined>(undefined)

	useEffect(() => {
		if (notifications.length && !messageInfo) {
			// Set a new snack when we don't have an active one
			setMessageInfo(takeNotification()!)
			setOpen(true)
		} else if (notifications.length && messageInfo && open) {
			// Close an active snack when a new one is added
			setOpen(false)
		}
	}, [notifications, messageInfo, open, takeNotification])

	const handleRequestClose = useCallback(() => {
		setMessageInfo(undefined)
	}, [setMessageInfo])

	const message =
		isString(messageInfo?.message) &&
		(messageInfo?.message.startsWith("ra.") || messageInfo?.message.startsWith("resources."))
			? translate(messageInfo?.message, messageInfo?.notificationOptions?.messageArgs)
			: messageInfo?.message

	// if (!open) return <></>
	if (!messageInfo) return <></>

	return (
		<AutoClose
			open={open}
			onClose={handleRequestClose}
			timeout={messageInfo?.notificationOptions?.autoHideDuration}
		>
			<NotificationGroup>
				<Notification type={messageInfo?.type}>{message}</Notification>
			</NotificationGroup>
		</AutoClose>
	)
}

const AutoClose = (props: {
	open: boolean
	children: JSX.Element
	timeout?: number
	onClose: () => void
}): JSX.Element => {
	const [done, setDone] = useState(false)
	useTimeoutFn(() => {
		props.onClose()
		setDone(true)
	}, props.timeout ?? 4000)

	if (done || !open) return <></>
	return props.children
}
