/**
 * @prettier
 * @flow
 */

import memoize from 'lodash/memoize'
import { spawn } from 'promisify-child-process'

const isInGitRepo: (dir: string) => Promise<boolean> = memoize(
  (dir: string): Promise<boolean> =>
    spawn('git', ['-C', dir, 'rev-parse']).then(
      () => true,
      () => false
    )
)

export default isInGitRepo
