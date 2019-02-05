// @flow

import { spawn } from 'promisify-child-process'
import { parse as parseUrl } from 'url'

type Url = $Call<<T>((url: string) => T) => T, typeof parseUrl>

const repoRegExp = new RegExp('^/(.+?)/([^/.]+)')

export default function parseRepositoryUrl(
  url: string
): Url & {
  organization: string,
  repo: string,
} {
  const parsed = parseUrl(url)
  const match = repoRegExp.exec(parsed.path || '')
  if (!match) throw new Error(`unsupported source repository url: ${url}`)
  const [organization, repo] = match.slice(1)
  return Object.assign((parsed: any), { organization, repo })
}

export async function parseRemoteUrl(
  packageDirectory: string,
  remote: string
): Promise<
  Url & {
    organization: string,
    repo: string,
  }
> {
  const stdout = (await (spawn('git', ['remote', 'get-url', remote], {
    // $FlowFixMe
    cwd: packageDirectory,
    maxBuffer: 1024,
  }): any)).stdout
    .toString('utf8')
    .trim()
  return parseRepositoryUrl(stdout)
}
