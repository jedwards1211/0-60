// @flow

import path from 'path'
import os from 'os'
import yaml from 'js-yaml'
import * as fs from 'fs-extra'
import { type GithubConfig } from './getGitHubConfig'
import { type CircleCIConfig } from './getCircleCIConfig'
import { once } from 'lodash'

export type Config = {
  'github.com'?: Array<GithubConfig>,
  'circleci.com'?: CircleCIConfig,
}

let config: Config = {}

const configFile = path.join(os.homedir(), '.config', '0-60')

export const readConfig: () => Promise<Config> = once(
  async (): Promise<Config> => {
    try {
      config = (yaml.safeLoad(await fs.readFile(configFile, 'utf8')): any)
    } catch (error) {
      // ignore
    }

    return config
  }
)

export async function writeConfig(changes: $Shape<Config>): Promise<void> {
  await readConfig()
  Object.assign(config, changes)
  await fs.writeFile(configFile, yaml.safeDump(config), 'utf8')
}
