// @flow

import { spawn } from 'promisify-child-process'
import * as fs from 'fs-extra'
import path from 'path'
import parseRepositoryUrl from './parseRepositoryUrl'
import octokit, { authenticate } from './octokit'
import getGitHubConfig from './getGitHubConfig'

type Options = {
  private?: ?boolean,
}

async function createGitHubRepository(
  packageDirectory: string,
  options: Options = {}
): Promise<any> {
  await authenticate()

  const rawRepositoryUrl = (await spawn(
    'git',
    ['remote', 'get-url', 'origin'],
    {
      cwd: packageDirectory,
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
  try {
    if (repositoryUrl.organization !== user) {
      return await octokit.repos.createForOrg({
        ...props,
        org: repositoryUrl.organization,
      })
    } else {
      return await octokit.repos.create(props)
    }
  } catch (error) {
    if (!/Repository creation failed/i.test(error.message)) throw error
  } finally {
    console.error('done!') // eslint-disable-line no-console
  }
}

export default createGitHubRepository

if (!module.parent) {
  createGitHubRepository(process.argv[2]).then(console.log, console.error) // eslint-disable-line no-console
}
