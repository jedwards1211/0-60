// @flow

import Travis from 'travis-ci'
import { promisify } from 'es6-promisify'
import { parseRemoteUrl } from './parseRepositoryUrl'
import getGitHubConfig from './getGitHubConfig'

const travis = new Travis({
  version: '2.0.0',
})

async function setUpTravisCI(packageDirectory: string): Promise<void> {
  process.stderr.write(`Setting up Travis CI...`)
  const repositoryUrl = await parseRemoteUrl(packageDirectory, 'origin')

  const { oauth_token } = await getGitHubConfig()

  await promisify(cb =>
    travis.authenticate(
      {
        github_token: oauth_token,
      },
      cb
    )
  )()
  const result = await promisify(cb =>
    travis.repos(repositoryUrl.organization, repositoryUrl.repo).get(cb)
  )()
  if (!result || !result.repo)
    throw new Error(
      `failed to get travis repo for ${repositoryUrl.organization}/${
        repositoryUrl.repo
      }`
    )

  const {
    repo: { id },
  } = result
  await promisify(cb => travis.hooks(id).put({ hook: { active: true } }, cb))()
  process.stderr.write('done!\n')
}

export default setUpTravisCI
