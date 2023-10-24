import { Dialog as HeadlessDialog, Transition, TransitionClasses } from "@headlessui/react"
import { clsx } from "clsx"
import { ElementType, Fragment, PropsWithChildren, ReactNode } from "react"

type DialogProps = {
	open?: boolean
	// used for easier with react
	onClose: (val: boolean) => void
	// title?: ReactNode
	children: ReactNode
	className?: string
	// titleClassName?: string
	noStyle?: boolean
	as?: ElementType
	transitionProps?: TransitionClasses
}

/**
 * @todo Scroll not ideal
 */
export const Dialog = (props: DialogProps): JSX.Element => {
	return (
		<Transition
			show={props.open}
			enter=""
			enterFrom=""
			enterTo=""
			leave=""
			leaveFrom=""
			leaveTo=""
			unmount
		>
			<HeadlessDialog
				onClose={props.onClose}
				as={props.as ?? "div"}
				className={clsx("du-modal du-modal-open")}
				data-testid="s-dialog"
			>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-200"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<HeadlessDialog.Backdrop className="fixed inset-0 bg-black/30"></HeadlessDialog.Backdrop>
				</Transition.Child>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-200"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
					{...props.transitionProps}
				>
					<HeadlessDialog.Panel
						className={clsx(
							"max-h-max bg-base-100",
							props.noStyle !== true &&
								"mx-[5%] max-h-[90vh] w-full overflow-y-auto rounded-md p-4",
							props.className,
						)}
					>
						{props.children}

						{/* Do I need this? */}
						<button
							className="sr-only"
							tabIndex={-1}
							onClick={() => props.onClose(true)}
						>
							Close Dialog
						</button>
					</HeadlessDialog.Panel>
				</Transition.Child>
			</HeadlessDialog>
		</Transition>
	)
}

Dialog.Title = ({
	children,
	...props
}: PropsWithChildren<Omit<JSX.IntrinsicElements["h2"], "ref">>) => {
	return <HeadlessDialog.Title {...props}>{children}</HeadlessDialog.Title>
}

Dialog.Description = ({
	children,
	...props
}: PropsWithChildren<Omit<JSX.IntrinsicElements["p"], "ref">>) => {
	return <HeadlessDialog.Description {...props}>{children}</HeadlessDialog.Description>
}
