/**
 * @flow
 * @prettier
 */

import fileExists from './fileExists'

import path from 'path'
import { spawn } from 'promisify-child-process'

export default async function installDeps({
  packageDirectory,
}: {
  packageDirectory: string,
}): Promise<void> {
  if (await fileExists(path.join(packageDirectory, 'yarn.lock'))) {
    await spawn('yarn', { cwd: packageDirectory, stdio: 'inherit' })
  } else {
    await spawn('npm', ['install'], {
      cwd: packageDirectory,
      stdio: 'inherit',
    })
  }
}
