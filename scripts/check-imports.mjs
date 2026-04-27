#!/usr/bin/env node
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const here = path.dirname(fileURLToPath(import.meta.url))
const sharedScript = path.resolve(here, '../../../../03_SaaS/shared/tooling/check-imports.mjs')

await import(pathToFileURL(sharedScript).href)
