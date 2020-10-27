// @flow

import getGitHubConfig from './getGitHubConfig'
import { once } from 'lodash'
import { Octokit } from '@octokit/rest'

// $FlowFixMe
const getOctokit: () => Promise<Octokit> = once(
  async () =>
    new Octokit({
      auth: `token ${(await getGitHubConfig()).oauth_token}`,
      previews: ['mercy-preview'],
    })
)

export default getOctokit
