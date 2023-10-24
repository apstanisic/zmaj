import { useRecord } from "@admin-panel/hooks/use-record"
import {
	ChoicesContextProvider,
	ResourceContextProvider,
	UseReferenceInputControllerParams,
	useReferenceInputController,
} from "ra-core"
import { ReactNode, useMemo } from "react"

export function ManyToOneReferenceInput(
	props: UseReferenceInputControllerParams & { children?: ReactNode },
): JSX.Element {
	const { children, reference } = props
	const fkValue = useRecord()?.[props.source]

	const controllerProps = useReferenceInputController({
		perPage: 10,
		...props,
	})
	// IDK why are they changing total
	// Always use `availableChoices`, not all choices, since `allChoices` always appends current value
	// https://github.com/marmelab/react-admin/blob/b53b178b9e7cf8347e0199cff6cced40b8dfe3ab/packages/ra-core/src/controller/input/useReferenceInputController.ts#L134
	const fixedChoicesProps = useMemo(() => {
		const shouldReduceOne = !controllerProps.availableChoices.some(
			(choice) => choice.id === fkValue,
		)

		const total = shouldReduceOne ? (controllerProps.total ?? 1) - 1 : controllerProps.total
		return { ...controllerProps, total }
	}, [controllerProps, fkValue])

	return (
		<ResourceContextProvider value={reference}>
			<ChoicesContextProvider value={fixedChoicesProps}>
				<>{children}</>
			</ChoicesContextProvider>
		</ResourceContextProvider>
	)
}
