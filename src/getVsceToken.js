// @flow

import * as fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { spawn } from 'promisify-child-process'

async function baseGetVsceToken(publisher: string): Promise<?string> {
  try {
    const config = await fs.readJson(path.resolve(os.homedir(), '.vsce'))
    const item = config.publishers.find((p) => p.name === publisher)
    if (item && item.pat) return item.pat
  } catch (error) {
    // ignore
  }
}

export default async function getVsceToken(publisher: string): Promise<string> {
  let token = await baseGetVsceToken(publisher)
  if (token) return token

  console.error('Creating VSCE publisher...') // eslint-disable-line no-console
  await spawn('vsce', ['create-publisher', publisher], {
    stdio: 'inherit',
  })

  token = await baseGetVsceToken(publisher)
  if (!token) {
    throw new Error('expected vsce token to be created')
  }
  return token
}
