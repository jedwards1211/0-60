#!/usr/bin/env node
// @flow

import path from 'path'
import { spawn } from 'promisify-child-process'
import inquirer from 'inquirer'
import * as fs from 'fs-extra'
import os from 'os'
import fileExists from './fileExists'

import installDeps from './installDeps'

const required = s => Boolean(s) || 'required'

const configPromise = fs
  .readJson(path.join(os.homedir(), '.0-60.json'))
  .catch(() => ({}))
const gitPromise = spawn('which', ['hub']).then(() => 'hub', () => 'git')

async function cli(): Promise<void> {
  const git = await gitPromise
  let packageDirectory: string = process.cwd()
  let remotes: Set<string> = new Set()
  let hasSkeleton = 'clone' === process.argv[2]

  if (hasSkeleton) {
    if (!process.argv[3]) {
      console.error('Usage: 0-60 clone <REPO URL>') // eslint-disable-line no-console
      process.exit(1)
    }
  }

  if (!hasSkeleton) {
    try {
      remotes = new Set(
        // $FlowFixMe
        (await spawn(git, ['remote'], { maxBuffer: 1024 * 1024 })).stdout
          .toString('utf8')
          .split(/\r\n|\r|\n/gm)
      )
    } catch (error) {
      // ignore
    }
  }

  if (remotes.has('skeleton')) {
    await spawn(git, ['diff-index', '--quiet', 'HEAD', '--']).catch(() => {
      console.error(`Please commit your changes and re-run.`) // eslint-disable-line no-console
      process.exit(1)
    })
    const { isPrivate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'isPrivate',
        message: 'Create private repository?',
        default: false,
      },
    ])
    await require('./createGitHubRepository').default(packageDirectory, {
      private: isPrivate,
    })
    console.error('Pushing to GitHub...') // eslint-disable-line no-console
    await spawn(git, ['push'], { stdio: 'inherit' })

    if (await fileExists(path.join(packageDirectory, '.travis.yml'))) {
      await require('./setUpTravisCI').default(packageDirectory)
    }
    if (
      await fileExists(path.join(packageDirectory, '.circleci', 'config.yml'))
    ) {
      await require('./setUpCircleCI').default(packageDirectory)
    }
  } else {
    const {
      skeleton,
      directory,
      name,
      description,
      author,
      keywords,
      organization,
      repo,
    } = await promptForSetUpSkeleton()

    await spawn(git, ['clone', skeleton, directory], {
      stdio: 'inherit',
    })
    await require('./setUpSkeleton').default({
      packageDirectory: directory,
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
    await installDeps({ packageDirectory: directory })

    console.error('Ready to go!') // eslint-disable-line no-console
  }
}

type SkeletonAnswers = {
  skeleton: string,
  directory: string,
  name: string,
  description: string,
  author: string,
  keywords: Array<string>,
  organization: string,
  repo: string,
  ready: boolean,
}

async function promptForSetUpSkeleton(): Promise<SkeletonAnswers> {
  let defaultAuthor
  try {
    // $FlowFixMe
    defaultAuthor = (await spawn('git', ['config', 'user.name'], {
      maxBuffer: 1024,
    })).stdout
      .toString('utf8')
      .trim()
  } catch (error) {
    // ignore
  }

  let argvSkeleton: ?string =
    'clone' === process.argv[2] ? process.argv[3] : null

  const questions = [
    {
      type: 'input',
      name: 'directory',
      message: 'Destination directory:',
      validate: required,
    },
    {
      type: 'input',
      name: 'name',
      message: 'Package name:',
      default: ({ directory }) => path.basename(directory),
      validate: required,
    },
    {
      type: 'input',
      name: 'description',
      message: 'Package description:',
      validate: required,
    },
    {
      type: 'input',
      name: 'author',
      default: defaultAuthor,
      message: 'Package author:',
      validate: required,
    },
    {
      type: 'input',
      name: 'keywords',
      message: 'Package keywords:',
      filter: text => text.split(/\s*,\s*|\s+/g),
      transformer: values =>
        values instanceof Array ? values.join(',') : values,
    },
    {
      type: 'input',
      name: 'organization',
      default: ({
        name,
        skeleton: promptSkeleton,
      }: {
        name: string,
        skeleton: ?string,
      }): ?string => {
        const match = /^@(.*?)\//.exec(name)
        if (match) return match[1]
        const skeleton = argvSkeleton || promptSkeleton
        if (!skeleton) return undefined
        const parts = skeleton.split(/\//g)
        if (parts.length >= 2) return parts[parts.length - 2]
      },
      message: 'GitHub organization:',
      validate: required,
    },
    {
      type: 'input',
      name: 'repo',
      message: 'GitHub repo:',
      default: ({ name }) => name.replace(/^@(.*?)\//, ''),
      validate: required,
    },
    {
      name: 'ready',
      type: 'confirm',
      default: true,
      message: 'Ready to go?',
    },
  ]
  if (!argvSkeleton) {
    const { skeletons } = await configPromise
    questions.unshift(
      skeletons
        ? {
            type: 'list',
            name: 'skeleton',
            choices: skeletons,
            message: 'Skeleton repo:',
            validate: required,
          }
        : {
            type: 'input',
            name: 'skeleton',
            message: 'Skeleton repo:',
            validate: required,
          }
    )
  }

  let answers: SkeletonAnswers
  do {
    answers = await inquirer.prompt(questions)
    for (const question of questions) {
      const { name, transformer } = (question: any)
      if (name !== 'ready') {
        const answer = answers[name]
        ;(question: any).default = transformer ? transformer(answer) : answer
      }
    }
  } while (!answers.ready)

  answers.directory = path.resolve(answers.directory)
  if (argvSkeleton) answers.argvSkeleton = argvSkeleton
  return answers
}

cli().then(
  () => process.exit(0),
  (err: Error) => {
    console.error(err.message) // eslint-disable-line no-console
    if ((err: any).stdout) console.error((err: any).stdout.toString('utf8')) // eslint-disable-line no-console
    if ((err: any).stderr) console.error((err: any).stderr.toString('utf8')) // eslint-disable-line no-console
    process.exit(1)
  }
)

export default cli
