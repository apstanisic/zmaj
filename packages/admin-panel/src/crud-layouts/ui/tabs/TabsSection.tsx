import { Tab } from "@headlessui/react"
import { clsx } from "clsx"
import { forwardRef, memo, PropsWithChildren } from "react"

/**
 * Render tab section
 */
export const TabsSection = memo((props: PropsWithChildren<any>) => {
	return (
		// <Tab.Panel as={LayoutSection} {...props}>
		<Tab.Panel {...props} className={clsx("grid gap-y-4", props.className)}>
			{props.children}
		</Tab.Panel>
	)
	// return (
	// 	<Tab.Panel as={RemoveFocus} {...props}>
	// 		<LayoutSection largeGap>{props.children}</LayoutSection>
	// 	</Tab.Panel>
	// )
})

/**
 * We use this so we can remove focus on div, since it's not needed
 * https://github.com/tailwindlabs/headlessui/discussions/1433
 * We need to forwardRef since react is throwing errors in console
 */
const RemoveFocus = forwardRef(({ children, ...props }: PropsWithChildren<any>, ref) => {
	return (
		<div ref={ref as any} {...props} tabIndex={-1} className={clsx("p-2", props.className)}>
			{children}
		</div>
	)

	//
})
