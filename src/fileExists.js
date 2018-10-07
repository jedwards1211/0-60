// @flow

import fs from 'fs-extra'

export default async function fileExists(file: string): Promise<boolean> {
  try {
    return (await fs.stat(file)).isFile()
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}
