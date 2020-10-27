// @flow

import { once } from 'lodash'
import inquirer from 'inquirer'
import { readConfig, writeConfig } from './config'

export type CircleCIConfig = {
  token: string,
}

const required = (s) => Boolean(s) || 'required'

const getCircleCIConfig: () => Promise<CircleCIConfig> = once(
  async (): Promise<CircleCIConfig> => {
    try {
      const config = await readConfig()
      if (config['circleci.com']) return config['circleci.com']
    } catch (error) {
      // ignore
    }

    const { token } = await inquirer.prompt([
      {
        type: 'input',
        name: 'token',
        message: 'CircleCI token:',
        validate: required,
      },
    ])

    const circleCIConfig = {
      token,
    }
    await writeCircleCIConfig(circleCIConfig)

    return circleCIConfig
  }
)
export default getCircleCIConfig

export async function writeCircleCIConfig(
  config: CircleCIConfig
): Promise<void> {
  await writeConfig({ 'circleci.com': config })
}
