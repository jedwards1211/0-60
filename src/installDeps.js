/**
 * @flow
 * @prettier
 */

import path from 'path'
import * as fs from 'fs-extra'
import { spawn } from 'promisify-child-process'

export default async function installDeps({
  packageDirectory,
}: {
  packageDirectory: string,
}): Promise<void> {
  if (await fs.exists(path.join(packageDirectory, 'yarn.lock'))) {
    await spawn('yarn', { cwd: packageDirectory, stdio: 'inherit' })
  } else {
    await spawn('npm', ['install'], {
      cwd: packageDirectory,
      stdio: 'inherit',
    })
  }
}
