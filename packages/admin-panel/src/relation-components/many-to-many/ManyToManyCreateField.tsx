import { Except } from "type-fest"
import {
	OneToManyCreateField,
	OneToManyCreateFieldProps,
} from "../one-to-many/OneToManyCreateField"

export function ManyToManyCreateField(props: Except<OneToManyCreateFieldProps, "target">) {
	// since it's create, we do not have to pass proper fk field
	// we do not have record to reference, it will simply ignore it
	return <OneToManyCreateField {...props} target="ZMAJ_NOT_IMPORTANT" />
}
