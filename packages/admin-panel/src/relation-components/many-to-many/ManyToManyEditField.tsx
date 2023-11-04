import { OneToManyEditField, OneToManyEditFieldProps } from "../one-to-many/edit/OneToManyEditField"

export function ManyToManyEditField(props: OneToManyEditFieldProps) {
	return <OneToManyEditField {...props} currentItems={<>Hello</>} />
}
