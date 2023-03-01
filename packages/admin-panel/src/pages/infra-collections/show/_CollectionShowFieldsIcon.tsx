import { Tooltip } from "@admin-panel/ui/Tooltip"
import { CollectionDef, FieldDef } from "@zmaj-js/common"
import { memo } from "react"
import {
	MdFingerprint,
	MdOutlineArrowRightAlt,
	MdOutlineVpnKey,
	MdVisibilityOff,
} from "react-icons/md"

type FieldIconProps = {
	collection: CollectionDef
	field: FieldDef
}

/**
 * Display some basic info about field
 * is hidden field, is primary key, is foreign key...
 */
export const CollectionShowFieldsIcon = memo(({ collection, field }: FieldIconProps) => {
	const icons: JSX.Element[] = []

	if (field.canRead === false) {
		icons.push(
			<Tooltip key="Hidden" side="left" text="This field is hidden">
				<MdVisibilityOff />
			</Tooltip>,
		)
	}

	if (field.isPrimaryKey) {
		icons.push(
			<Tooltip key="PK" side="left" text="Identifier (Primary key)">
				<MdOutlineVpnKey />
			</Tooltip>,
		)
	}

	if (field.isForeignKey) {
		icons.push(
			<Tooltip key="FK" side="left" text="This field is part of the relation (Foreign key)">
				<MdOutlineArrowRightAlt />
			</Tooltip>,
		)
	}

	if (field.isUnique && !field.isPrimaryKey) {
		icons.push(
			<Tooltip key="unique" side="left" text="Unique">
				<MdFingerprint />
			</Tooltip>,
		)
	}

	return <div className="flex gap-x-3">{icons}</div>
})
