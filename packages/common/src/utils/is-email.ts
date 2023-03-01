import { z } from "zod"
import { Email } from "../types"

export function isEmail(email: unknown): email is Email {
	return z.string().email().max(150).safeParse(email).success
}
