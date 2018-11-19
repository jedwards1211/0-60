// @flow

import globby from 'globby'
import fs from 'fs-extra'
import path from 'path'
import {update} from 'lodash'
import {spawn} from 'promisify-child-process'
import parseRepositoryUrl from './parseRepositoryUrl'

export type Options = {
  packageDirectory: string,
  name: string,
  description: string,
  author?: ?string,
  keywords?: ?Array<string>,
  git?: ?{
    organization: string,
    repo: string,
  },
}

export default async function setUpSkeleton({
  packageDirectory,
  name,
  description,
  author,
  keywords,
  git,
}: Options): Promise<void> {
  const packageJsonPath = path.resolve(packageDirectory, 'package.json')
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))

  const {
    name: oldName,
    description: oldDescription,
    repository,
    author: oldAuthor,
  } = packageJson

  if (!repository || !repository.url) throw new Error('missing source repository')
  if (repository.type !== 'git') throw new Error(`unsupported source repository type: ${repository.type}`)

  await spawn('git', ['remote', 'add', 'skeleton', repository.url], {
    cwd: packageDirectory,
    stdio: 'inherit',
  })

  const {organization: oldOrganization, repo: oldRepo} = parseRepositoryUrl(repository.url)
  const oldRepoPath = `${oldOrganization}/${oldRepo}`

  Object.assign(packageJson, {name, description})
  if (author) packageJson.author = author
  if (keywords) packageJson.keywords = keywords
  if (git) {
    const newRepoPath = `${git.organization}/${git.repo}`

    for (let field of ['repository.url', 'homepage', 'bugs.url']) {
      update(packageJson, field, url => url && url.replace(oldRepoPath, newRepoPath))
    }

    try {
      await spawn('git', ['remote', 'set-url', 'origin', packageJson.repository.url], {
        cwd: packageDirectory,
        stdio: 'inherit'
      })
    } catch (error) {
      await spawn('git', ['remote', 'add', 'origin', packageJson.repository.url], {
        cwd: packageDirectory,
        stdio: 'inherit'
      })
    }
  }

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8')

  const replacements = [[oldDescription, description]]
  if (author) replacements.push([oldAuthor, author])
  if (git) replacements.push([oldRepoPath, `${git.organization}/${git.repo}`])
  replacements.push([new RegExp(`([a-z]+://.+?/)${oldName}`, 'g'), `$1${encodeURIComponent(name)}`])
  replacements.push([oldName, name])

  await replaceInFiles(packageDirectory, replacements)
}

async function replaceInFiles(
  directory: string,
  replacements: Iterable<[RegExp | string, string]>,
): Promise<void> {
  const files = await globby(path.resolve(directory, '**'))

  await Promise.all(files.map(async (file: string): Promise<void> => {
    let oldText
    try {
      oldText = await fs.readFile(file, 'utf8')
    } catch (err) {
      if (err.code === 'EISDIR') return
      throw err
    }
    let newText = oldText
    for (let [find, replace] of replacements) {
      newText = replaceAll(newText, find, replace)
    }
    if (newText !== oldText) await fs.writeFile(file, newText, 'utf8')
  }))
}

function escapeRegExp(str: string): string {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
}

function replaceAll(str: string, find: RegExp | string, replace: string): string {
  if (find instanceof RegExp) return str.replace(find, replace)
  return str.replace(new RegExp(`\\b(?:${escapeRegExp(find)})\\b`, 'g'), replace)
}
