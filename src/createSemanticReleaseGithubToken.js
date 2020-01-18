// @flow

import Octokit from '@octokit/rest'
import base32 from 'base32'
import crypto from 'crypto'

function randomId(): string {
  return base32.encode(crypto.randomBytes(4))
}

export default async function createSemanticReleaseGithubToken(
  octokit: Octokit
): Promise<string> {
  const response = await octokit.oauthAuthorizations.createAuthorization({
    scopes: [
      'repo',
      'read:org',
      'user:email',
      'repo_deployment',
      'repo:status',
      'write:repo_hook',
      'write:packages',
      'read:packages',
    ],
    note: `semantic-release-${randomId()}`,
  })
  const token = response.data ? response.data.token : null
  if (!token) {
    throw new Error(
      'failed to get token from response: ' + JSON.stringify(response, null, 2)
    )
  }

  return token
}
