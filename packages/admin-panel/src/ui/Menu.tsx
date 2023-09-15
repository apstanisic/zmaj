import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react-dom"
import { Menu as HeadlessMenu } from "@headlessui/react"
import { Struct, filterStruct } from "@zmaj-js/common"
import { clsx } from "clsx"
import { isString } from "radash"
import { Fragment, ReactNode, forwardRef, useMemo, useRef } from "react"
import { Link } from "react-router-dom"

const DirtyDirtyWorkaroundButton = forwardRef<
	any,
	{ btn: (ref: any, props: Struct) => ReactNode } & Struct
>(({ btn, ...props }, ref) => {
	const innerRef = useRef<any>(null)

	const all = useMemo(() => {
		const nonEvents = filterStruct(props, (_, k) => !k.toString().startsWith("on"))
		const events = filterStruct(props, (_, k) => k.toString().startsWith("on"))
		return { events, nonEvents }
	}, [props])

	const rendered = useMemo(() => btn(innerRef, all.nonEvents), [btn, all.nonEvents])

	return (
		<div className="flex h-full w-full">
			{rendered}
			<button
				ref={(rf) => {
					innerRef.current = rf
					// @ts-ignore
					ref?.(rf)
				}}
				aria-hidden="true"
				{...all.events}
				className="h-0 w-0 overflow-hidden"
			></button>
		</div>
	)
})

export function Menu(props: Props): JSX.Element {
	const {
		x,
		y,
		refs: { setReference, setFloating },
		strategy,
	} = useFloating({
		middleware: [offset(0), flip(), shift({ padding: 10 })],
		placement: "bottom",
		strategy: "fixed",
		whileElementsMounted: autoUpdate,
	})
	return (
		<HeadlessMenu>
			{/* <HeadlessMenu.Button as="div" ref={reference}> */}
			<div ref={setReference}>
				<HeadlessMenu.Button as={Fragment}>
					<DirtyDirtyWorkaroundButton btn={props.button!} />
					{/* <AAA /> */}
				</HeadlessMenu.Button>
				{/* {props.button(buttonProps)} */}
				{/* {button} */}
			</div>
			{/* </HeadlessMenu.Button> */}
			<HeadlessMenu.Items
				as="ul"
				// Hide outline since it's distinct enough
				className="z-30 min-w-[150px] gap-y-1 overflow-hidden rounded-md border bg-base-100 py-1 text-base-content shadow-lg outline-none"
				ref={setFloating}
				style={{
					position: strategy,
					top: y ?? 0,
					left: x ?? 0,
					width: "max-content",
				}}
			>
				{props.items.map((item, i) => {
					const { endIcon, startIcon, title, button, ...rest } = item
					const Comp = isString(item.button) ? item.button : item.button ? "button" : Link
					return (
						<HeadlessMenu.Item key={i} disabled={item.disabled}>
							{({ active }) => (
								// <li className="">
								<Comp
									{...(rest as any)}
									className={clsx("flex w-full px-2 py-2", active && "bg-base-200")}
								>
									<span>{startIcon}</span>
									<span className={clsx(startIcon && "ml-2")}>{title}</span>
									<span className="ml-auto">{endIcon}</span>
								</Comp>
								// </li>
							)}
						</HeadlessMenu.Item>
					)
				})}
			</HeadlessMenu.Items>
		</HeadlessMenu>
	)
}

// Menu.Button = function <T>(props: HeadlessInferType<T>) {
// 	const { as, children, ...rest } = props
// 	return (
// 		<HeadlessMenu.Button as={as} {...rest}>
// 			{children}
// 		</HeadlessMenu.Button>
// 	)
// }

export type MenuItemParams = {
	startIcon?: ReactNode
	endIcon?: ReactNode
	title?: string
	disabled?: boolean
} & (
	| { to: string; button?: false } //
	| ({ button: true } & JSX.IntrinsicElements["button"])
	| { button: string }
)

type Props = {
	button?: (ref: React.RefObject<HTMLButtonElement> | null, props: Struct) => ReactNode
	items: MenuItemParams[]
}
