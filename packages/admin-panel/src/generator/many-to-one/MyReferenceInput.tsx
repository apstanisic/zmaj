import {
	ChoicesContextProvider,
	ResourceContextProvider,
	useReferenceInputController,
	UseReferenceInputControllerParams,
} from "ra-core"

export function MyReferenceInput(
	props: UseReferenceInputControllerParams & { children?: JSX.Element },
): JSX.Element {
	//
	const { children, reference } = props

	const controllerProps = useReferenceInputController(props)

	return (
		<ResourceContextProvider value={reference}>
			<ChoicesContextProvider value={controllerProps}>{children}</ChoicesContextProvider>
		</ResourceContextProvider>
	)
}
