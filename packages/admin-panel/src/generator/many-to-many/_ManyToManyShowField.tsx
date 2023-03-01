import { memo } from "react"
import { ShowFieldContainer } from "../../shared/show/ShowFieldContainer"
import { ToManyShowRows } from "../to-many/show/ToManyShowRows"
import { ManyToManyCurrent } from "./ManyToManyCurrent"
import { ManyToManyInternalProps } from "./ManyToManyInternalProps.type"

export const ManyToManyShowField = memo((props: ManyToManyInternalProps) => {
	return (
		<ShowFieldContainer label={props.label} className={props.className}>
			<ManyToManyCurrent>
				<ToManyShowRows template={props.template} />
			</ManyToManyCurrent>
		</ShowFieldContainer>
	)
})
