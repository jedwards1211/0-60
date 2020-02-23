// @flow

import { spawn } from 'promisify-child-process'
import * as fs from 'fs-extra'
import path from 'path'
import parseRepositoryUrl from './parseRepositoryUrl'
import getOctokit from './octokit'
import getGitHubConfig from './getGitHubConfig'

type Options = {
  private?: ?boolean,
}

async function createGitHubRepository(
  packageDirectory: string,
  options: Options = {}
): Promise<any> {
  const octokit = await getOctokit()

  const rawRepositoryUrl = (await spawn(
    'git',
    ['remote', 'get-url', 'origin'],
    {
      cwd: packageDirectory,
      maxBuffer: 1024,
    }
  ): any).stdout
    .toString('utf8')
    .trim()

  const repositoryUrl = parseRepositoryUrl(rawRepositoryUrl)

  const packageJson = JSON.parse(
    await fs.readFile(path.join(packageDirectory, 'package.json'), 'utf8')
  )

  const props = {
    name: repositoryUrl.repo,
    description: packageJson.description,
    private: options.private || false,
  }

  const { user } = await getGitHubConfig()

  process.stderr.write(`Creating ${rawRepositoryUrl}...`)
  let result
  try {
    if (repositoryUrl.organization !== user) {
      result = await octokit.repos.createInOrg({
        ...props,
        org: repositoryUrl.organization,
      })
    } else {
      result = await octokit.repos.createForAuthenticatedUser(props)
    }
  } catch (error) {
    if (!/Repository creation failed/i.test(error.message)) throw error
  }

  await octokit.activity.setRepoSubscription({
    owner: repositoryUrl.organization,
    repo: repositoryUrl.repo,
    subscribed: true,
  })
  await octokit.repos.replaceTopics({
    owner: repositoryUrl.organization,
    repo: repositoryUrl.repo,
    names: packageJson.keywords,
  })

  console.error('done!') // eslint-disable-line no-console

  return result
}

export default createGitHubRepository

if (!module.parent) {
  createGitHubRepository(process.argv[2]).then(console.log, console.error) // eslint-disable-line no-console
}
