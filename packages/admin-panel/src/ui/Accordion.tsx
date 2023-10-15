import { Disclosure, Transition } from "@headlessui/react"
import { clsx } from "clsx"
import { ReactNode } from "react"
import { HeadlessInferType } from "./HeadlessInferType"

export const Accordion = (props: {
	button: () => ReactNode
	children?: ReactNode
	unmount?: boolean
}): JSX.Element => {
	return (
		<Disclosure>
			{props.button()}
			<div className={clsx("relative w-full overflow-hidden")}>
				<Transition
					enter="transition ease-in-out duration-200 transform"
					enterFrom="-translate-y-full"
					enterTo="translate-y-0"
					leave="transition ease-in-out duration-200 transform"
					leaveFrom="translate-y-0"
					leaveTo="-translate-y-full"
				>
					<Disclosure.Panel unmount={props.unmount} className={"overflow-hidden px-0"}>
						{props.children}
					</Disclosure.Panel>
				</Transition>
			</div>
		</Disclosure>
	)
}

Accordion.Button = function <T>(props: HeadlessInferType<T>) {
	return <Disclosure.Button {...(props as any)}>{props.children}</Disclosure.Button>
}
