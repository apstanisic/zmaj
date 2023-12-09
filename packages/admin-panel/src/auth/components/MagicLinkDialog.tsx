import { FormEmailInput } from "@admin-panel/ui/Controlled"
import { Dialog } from "@admin-panel/ui/Dialog"
import { Button } from "@admin-panel/ui/buttons/Button"
import { Form, useNotify } from "ra-core"
import { useCallback, useState } from "react"
import { useSdk } from "../../context/sdk-context"
import { usePublicInfo } from "../hooks/use-public-info"

/**
 * It only renders button, but on click it will open a dialog where user can enter email
 */
export function MagicLinkDialog(): JSX.Element {
	const [show, setShow] = useState(false)
	const sdk = useSdk()
	const notify = useNotify()
	const info = usePublicInfo()
	// const { register, handleSubmit } = useForm({ defaultValues: { email: "" } })

	const onSubmit = useCallback(
		async ({ email }: { email: string }) => {
			setShow(false)
			await sdk.auth
				.sendMagicLink(email)
				.then(() => notify("Magic link has been sent to your email", { type: "success" }))
				.catch((e) => notify("Problem sending email", { type: "error" }))
		},
		[notify, sdk.auth],
	)

	if (info.data?.magicLink !== true) return <></>

	return (
		<>
			{/* Button always shown  */}
			<Button variant="outlined" className="mt-16 w-full" onPress={() => setShow(true)}>
				Sign In With Email Link
			</Button>
			{/* Dialog is only shown on click */}
			<Dialog open={show} onClose={() => setShow(false)} className="max-w-2xl">
				<p className="pb-4 text-xl">Enter your email</p>

				<Form
					defaultValues={{ email: "" }}
					onSubmit={async (data) => onSubmit(data as any)}
				>
					<FormEmailInput name="email" isRequired aria-label="Email" />

					<Button className="mt-4" type="submit">
						Send link
					</Button>
				</Form>
			</Dialog>
		</>
	)
}
