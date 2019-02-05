// @flow

import getGitHubConfig from './getGitHubConfig'
import { once } from 'lodash'

const octokit = require('@octokit/rest')()

export default octokit

export const authenticate = once(
  async (): Promise<void> => {
    octokit.authenticate({
      type: 'oauth',
      token: (await getGitHubConfig()).oauth_token,
    })
  }
)
