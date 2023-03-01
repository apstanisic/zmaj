#!/usr/bin/env node
import { zmajCli } from "@zmaj-js/cli"

async function bin(): Promise<void> {
	await zmajCli()
}
bin()
