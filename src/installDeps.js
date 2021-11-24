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
  const [isYarn, isPnpm] = await Promise.all([
    fs.exists(path.join(packageDirectory, 'yarn.lock')),
    fs.exists(path.join(packageDirectory, 'pnpm-lock.yaml')),
  ])
  if (isYarn) {
    await spawn('yarn', { cwd: packageDirectory, stdio: 'inherit' })
  } else if (isPnpm) {
    await spawn('pnpm', ['i'], { cwd: packageDirectory, stdio: 'inherit' })
  } else {
    await spawn('npm', ['install'], {
      cwd: packageDirectory,
      stdio: 'inherit',
    })
  }
}
