#!/usr/bin/env node

import path from 'path'
import {spawn} from 'promisify-child-process'
import inquirer from 'inquirer'
import fs from 'fs-extra'
import os from 'os'
import {parseRemoteUrl} from './parseRepositoryUrl'
import fileExists from './fileExists'

const required = s => Boolean(s) || 'required'

async function loadConfig() {
  try {
    return JSON.parse(await fs.readFile(path.join(os.homedir(), '.0-60.json'), 'utf8'))
  } catch (err) {
    return {}
  }
}

const configPromise = loadConfig()
const gitPromise = spawn('which', ['hub']).then(
  () => 'hub',
  () => 'git'
)

async function cli(): Promise<void> {
  const git = await gitPromise
  let packageDirectory: string = process.cwd()
  let remotes: Set<string>
  try {
    remotes = new Set((await spawn(git, ['remote'])).stdout.toString('utf8').split(/\r\n|\r|\n/mg))
  } catch (error) {
    let skeleton
    ({skeleton, packageDirectory} = await promptForCloneSkeleton())
    await spawn(git, ['clone', skeleton, packageDirectory], {stdio: 'inherit'})
    remotes = new Set((await spawn('git', ['remote'], {cwd: packageDirectory})).stdout.toString('utf8').split(/\r\n|\r|\n/mg))
  }
  if (remotes.has('skeleton')) {
    const packageJson = JSON.parse(await fs.readFile(path.join(packageDirectory, 'package.json'), 'utf8'))
    await spawn(git, ['diff-index', '--quiet', 'HEAD', '--']).catch(() => {
      console.error(`Please commit your changes and re-run.`) // eslint-disable-line no-console
      process.exit(1)
    })
    const {isPrivate} = await inquirer.prompt([
      {type: 'confirm', name: 'isPrivate', message: 'Create private repository?', default: false},
    ])
    await require('./createGitHubRepository').default(packageDirectory, {private: isPrivate})
    if (await fileExists(path.join(packageDirectory, '.travis.yml'))) {
      await require('./setUpTravisCI').default(packageDirectory)
    }
    if (packageJson.devDependencies && packageJson.devDependencies['semantic-release']) {
      await require('./setUpSemanticRelease').default(packageDirectory, {private: isPrivate})
    }
  } else {
    const {
      name, description, author, keywords, organization, repo
    } = await promptForSetUpSkeleton(packageDirectory)

    await require('./setUpSkeleton').default({
      packageDirectory,
      name,
      description,
      author,
      keywords,
      git: {
        organization,
        repo,
      },
    })

    console.error('Installing dependencies...') // eslint-disable-line no-console
    if (await fileExists(path.join(packageDirectory, 'yarn.lock'))) {
      await spawn('yarn', {cwd: packageDirectory, stdio: 'inherit'})
    } else {
      await spawn('npm', ['install'], {cwd: packageDirectory, stdio: 'inherit'})
    }

    console.error('Ready to go!') // eslint-disable-line no-console
  }
}

async function promptForCloneSkeleton() {
  const {skeletons} = await configPromise
  const {skeleton, directory} = await inquirer.prompt([
    skeletons
      ? {type: 'list', name: 'skeleton', choices: skeletons, message: 'Skeleton repo:', validate: required}
      : {type: 'input', name: 'skeleton', message: 'Skeleton repo:', validate: required},
    {type: 'input', name: 'directory', message: 'Destination directory:', validate: required},
  ])
  return {skeleton, packageDirectory: directory}
}

async function promptForSetUpSkeleton(packageDirectory) {
  const packageJson = JSON.parse(await fs.readFile(path.join(packageDirectory, 'package.json'), 'utf8'))
  let repositoryUrl
  try {
    repositoryUrl = await parseRemoteUrl(packageDirectory, 'origin')
  } catch (error) {
    console.error(error.stack) // eslint-disable-line no-console
  }
  let defaultAuthor
  try {
    defaultAuthor = (await spawn('git', ['config', 'user.name'])).stdout.toString('utf8').trim()
  } catch (error) {
    defaultAuthor = packageJson.author
  }
  return await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Package name:',
      default: path.basename(packageDirectory),
      validate: required,
    },
    {
      type: 'input',
      name: 'description',
      message: 'Package description:',
      validate: required
    },
    {
      type: 'input',
      name: 'author',
      default: defaultAuthor,
      message: 'Package author:',
      validate: required
    },
    {
      type: 'input',
      name: 'keywords',
      message: 'Package keywords:',
      transformer: text => text.split(/\s*,\s*|\s+/g),
    },
    {
      type: 'input',
      name: 'organization',
      default: ({name}) => {
        const match = /^@(.*?)\//.exec(name)
        if (match) return match[1]
        return repositoryUrl && repositoryUrl.organization
      },
      message: 'GitHub organization:',
      validate: required
    },
    {
      type: 'input',
      name: 'repo',
      message: 'GitHub repo:',
      default: ({name}) => name.replace(/^@(.*?)\//, ''),
      validate: required,
    },
  ])
}

cli().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message) // eslint-disable-line no-console
    if (err.stdout) console.error(err.stdout.toString('utf8')) // eslint-disable-line no-console
    if (err.stderr) console.error(err.stderr.toString('utf8')) // eslint-disable-line no-console
    process.exit(1)
  }
)

export default cli
