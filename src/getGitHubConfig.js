// @flow

import * as fs from 'fs-extra'
import os from 'os'
import path from 'path'
import yaml from 'js-yaml'
import { once } from 'lodash'
import inquirer from 'inquirer'
import Octokit from '@octokit/rest'
import createSemanticReleaseGithubToken from './createSemanticReleaseGithubToken'
import { readConfig, writeConfig } from './config'

export type GithubConfig = {
  user: string,
  oauth_token: string,
  semantic_release_token?: string,
}

const required = (s) => Boolean(s) || 'required'

const getGitHubConfig: () => Promise<GithubConfig> = once(
  async (): Promise<GithubConfig> => {
    try {
      const config = await readConfig()
      if (config['github.com']) return config['github.com'][0]
    } catch (error) {
      // ignore
    }

    try {
      const config = (yaml.safeLoad(
        await fs.readFile(path.join(os.homedir(), '.config', 'hub'), 'utf8')
      ): any)
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

    const semantic_release_token = await createSemanticReleaseGithubToken(
      octokit
    )

    const githubConfig = {
      user: username,
      oauth_token: token,
      semantic_release_token,
    }
    await writeGithubConfig(githubConfig)

    return githubConfig
  }
)

export default getGitHubConfig

export async function writeGithubConfig(
  githubConfig: GithubConfig
): Promise<void> {
  await writeConfig({ 'github.com': [githubConfig] })
}

if (!module.parent) {
  getGitHubConfig().then(console.log, console.error) // eslint-disable-line no-console
}
