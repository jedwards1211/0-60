// @flow

import * as fs from 'fs-extra'
import os from 'os'
import path from 'path'
import yaml from 'js-yaml'
import { once } from 'lodash'
import inquirer from 'inquirer'
import Octokit from '@octokit/rest'

type Config = {
  user: string,
  oauth_token: string,
}

const required = s => Boolean(s) || 'required'

const getGitHubConfig = once(
  async (): Promise<Config> => {
    try {
      const config: any = yaml.safeLoad(
        await fs.readFile(path.join(os.homedir(), '.config', 'hub'), 'utf8')
      )
      if (config['github.com']) return config['github.com'][0]
    } catch (error) {
      // ignore
    }
    try {
      const config: any = yaml.safeLoad(
        await fs.readFile(path.join(os.homedir(), '.config', '0-60'), 'utf8')
      )
      if (config['github.com']) return config['github.com'][0]
    } catch (error) {
      // ignore
    }

    const { username, password } = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'GitHub username:',
        validate: required,
      },
      {
        type: 'password',
        name: 'password',
        message: 'GitHub password:',
        validate: required,
      },
    ])

    const octokit = new Octokit({
      auth: {
        username,
        password,
      },
    })

    const result = await octokit.authorization.create({
      note: '0-60',
      client_id: '00000000000000000000',
      scopes: ['repo'],
    })
    const {
      data: { token },
    } = result

    const config = {
      user: username,
      oauth_token: token,
    }
    const data = yaml.safeDump({
      'github.com': [config],
    })
    await fs.writeFile(path.join(os.homedir(), '.config', '0-60'), data, 'utf8')

    return config
  }
)

export default getGitHubConfig

if (!module.parent) {
  getGitHubConfig().then(console.log, console.error) // eslint-disable-line no-console
}
