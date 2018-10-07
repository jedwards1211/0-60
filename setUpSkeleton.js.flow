// @flow

import glob from 'glob'
import fs from 'fs-extra'
import path from 'path'
import {update} from 'lodash'
import {promisify} from 'es6-promisify'
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
  replacements.push([oldName, name])

  const ignore = [
    path.join('.git', '**'),
    path.join('node_modules', '**'),
    'package.json',
    'yarn.lock',
    ...await readLines(path.resolve(packageDirectory, '.gitignore')).catch(() => []),
  ]

  replaceInFiles(packageDirectory, replacements, {ignore})
}

async function readLines(file: string): Promise<Array<string>> {
  const data = await fs.readFile(file, 'utf8')
  return data.split(/\r\n|\r|\n/mg)
}

async function replaceInFiles(
  directory: string,
  replacements: Iterable<[RegExp | string, string]>,
  {ignore = []}: {ignore?: Array<string>} = {}
): Promise<void> {
  const files = await promisify(glob)(path.resolve(directory, '**'), {
    dot: true,
    ignore: ignore.map(file => path.resolve(directory, file)),
  })

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
