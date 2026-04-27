#!/usr/bin/env node
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const project = 'site-wg'
const here = path.dirname(fileURLToPath(import.meta.url))
const sharedScript = path.resolve(here, './.wg-shared/tooling/check-imports.mjs')

void project
await import(pathToFileURL(sharedScript).href)
