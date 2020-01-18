// @flow

import { readFile } from 'fs-extra'
import os from 'os'

export default async function getNpmToken(
  env: { [name: string]: string | void } = process.env
): Promise<string> {
  const { NPM_TOKEN } = env
  if (NPM_TOKEN) return NPM_TOKEN
  try {
    const homedir = os.homedir()
    const npmrc = await readFile(`${homedir}/.npmrc`, 'utf8')
    const match = /:_authToken=([a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12})/.exec(
      npmrc
    )
    if (match) return match[1]
  } catch (error) {
    // ignore
  }
  throw new Error('Missing process.env.NPM_TOKEN or entry in ~/.npmrc')
}
