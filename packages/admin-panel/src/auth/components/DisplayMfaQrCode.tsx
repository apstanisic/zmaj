import { useSdk } from "@admin-panel/context/sdk-context"
import { Button } from "@admin-panel/ui/Button"
import { Card } from "@admin-panel/ui/Card"
import { Divider } from "@admin-panel/ui/Divider"
import { TextInput } from "@admin-panel/ui/TextInput"
import { intRegex } from "@zmaj-js/common"
import { useNotify } from "ra-core"
import { memo, useCallback, useState } from "react"
import { useTimeoutFn } from "react-use"
export const DisplayMfaQrCode = memo(
	(props: {
		title?: string
		image: string
		secret: string
		jwt: string
		backupCodes: string[]
		refreshCode: () => Promise<void>
		expiredDialog?: JSX.Element
		onConfirm?: () => void
	}) => {
		const sdk = useSdk()
		const [verifyCode, setVerifyCode] = useState("")
		const notify = useNotify()
		const [expired, setExpired] = useState(false)

		const onChange = useCallback((val: string) => {
			if (val === "") {
				setVerifyCode("")
				return
			}
			if (val.length > 6) return
			if (!intRegex.test(val)) return
			setVerifyCode(val)
		}, [])

		// // every 5 minutes, disable current qr code
		const [, , resetTimeout] = useTimeoutFn(() => setExpired(true), 290 * 1000)

		const confirmOtp = useCallback(() => {
			sdk.auth.mfa
				.confirmOtp({ code: verifyCode, jwt: props.jwt })
				.then(() => {
					notify("2FA enabled", { type: "success" })
					// redirect("/profile")
					props.onConfirm?.()
				})
				.catch(() => {
					notify("Problem enabling 2FA", { type: "error" })
				})
		}, [notify, props, sdk.auth.mfa, verifyCode])

		if (expired) {
			return (
				props.expiredDialog ?? (
					<Card className="w-full p-4">
						<h3 className="mb-5 text-xl">Setup 2 factor authentication</h3>
						<Button
							variant="warning"
							onClick={() =>
								void props.refreshCode().then(() => {
									setExpired(false)
									resetTimeout()
								})
							}
						>
							Time expired. Click here to get new qrcode
						</Button>
					</Card>
				)
			)
		}

		return (
			<Card className="w-full p-4 max-w-3xl">
				<h3 className="mb-5 text-xl">{props.title ?? "Setup 2 factor authentication"}</h3>
				<p>
					Use your 2FA app (like Google Authenticator) and scan QR code. If you are not able to scan
					QR code, enter this value in your app manually:
				</p>
				<pre className="mt-2 text-center text-lg font-bold" data-testid="mfaSecret">
					{props.secret}
				</pre>
				<img src={props.image} alt="QR Code for 2FA" className="mx-auto my-8 h-60 w-60" />
				<Divider />
				<div className="my-3">
					Please copy backup codes so that you can sign in case you lose access to your phone. We
					will not show them to you again:
					<pre className="mt-5 block ">
						{props.backupCodes.map((code) => (
							<p key={code}>{code}</p>
						))}
					</pre>
				</div>
				<Divider />
				After you configured your app, enter a code bellow to ensure everything is working correctly
				<div className="mt-2 flex items-center gap-x-4">
					<TextInput
						placeholder="123456"
						aria-label="2FA code"
						onChange={onChange}
						value={verifyCode}
						maxLength={6}
					/>
					<Button outline disabled={verifyCode.length !== 6} onClick={confirmOtp}>
						Confirm
					</Button>
				</div>
			</Card>
		)
	},
)
