// @flow

import { parseRemoteUrl } from './parseRepositoryUrl'
import getCircleCIClient from './CircleCIClient'
import getNpmToken from './getNpmToken'
import inquirer from 'inquirer'
import Octokit from '@octokit/rest'
import createSemanticReleaseGithubToken from './createSemanticReleaseGithubToken'
import getGithubConfig, { writeGithubConfig } from './getGitHubConfig'
import * as fs from 'fs-extra'
import path from 'path'
import getVsceToken from './getVsceToken'

const required = s => Boolean(s) || 'required'

export default async function setUpCircleCI(
  packageDirectory: string
): Promise<void> {
  process.stderr.write(`Following project on CircleCI...`)
  const { organization, repo } = await parseRemoteUrl(
    packageDirectory,
    'origin'
  )
  const packageJson = await fs.readJson(
    path.resolve(packageDirectory, 'package.json')
  )
  const circle = await getCircleCIClient()
  await circle.followProject({ username: organization, project: repo })
  process.stderr.write('done!\n')

  let githubConfig = await getGithubConfig()
  if (!githubConfig.semantic_release_token) {
    process.stderr.write(`Creating GitHub personal access token...`)

    const { username, password } = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'GitHub username:',
        default: githubConfig.user,
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

    githubConfig.semantic_release_token = await createSemanticReleaseGithubToken(
      octokit
    )
    await writeGithubConfig(githubConfig)

    process.stderr.write('done!\n')
  }

  const GH_TOKEN = githubConfig.semantic_release_token
  if (!GH_TOKEN) throw new Error('this should never happen')

  process.stderr.write(`Adding environment variables to CircleCI...`)
  const environment: {
    GH_TOKEN: string,
    NPM_TOKEN: string,
    VSCE_TOKEN?: string,
  } = { GH_TOKEN, NPM_TOKEN: await getNpmToken() }
  if (
    packageJson.devDependencies &&
    packageJson.devDependencies['semantic-release-vsce']
  ) {
    const { publisher } = packageJson
    if (!publisher) {
      throw new Error(
        'You must put a publisher in package.json to use semantic-release-vsce'
      )
    }
    environment.VSCE_TOKEN = await getVsceToken(publisher)
  }
  await circle.addEnvironmentVariables(
    { username: organization, project: repo },
    environment
  )
  process.stderr.write('done!\n')
}
