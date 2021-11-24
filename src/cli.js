#!/usr/bin/env node
// @flow

import path from 'path'
import { spawn as spawnRaw } from 'promisify-child-process'
import inquirer from 'inquirer'
import * as fs from 'fs-extra'
import os from 'os'
import installDeps from './installDeps'
import isInGitRepo from './isInGitRepo'
import createGitHubRepository from './createGitHubRepository'
import setUpSkeleton from './setUpSkeleton'
import setUpCircleCI from './setUpCircleCI'
import setUpTravisCI from './setUpTravisCI'

const required = (s) => Boolean(s) || 'required'

// our error handlers access the stdout and stderr of spawned processes, which
// is not captured unless the encoding flag is provided.
const spawn = (cmd: string, args: Array<string> = [], opts: Object = {}) =>
  spawnRaw(cmd, args, { encoding: 'utf8', ...opts })

const configPromise = fs
  .readJson(path.join(os.homedir(), '.0-60.json'))
  .catch(() => ({}))

async function cli(): Promise<void> {
  const command = process.argv[2]

  if (command === 'clone') {
    if (!process.argv[3]) {
      console.error('Usage: 0-60 clone <REPO URL>') // eslint-disable-line no-console
      process.exit(1)
    }
  }

  if (
    command === 'push' ||
    (command !== 'clone' && (await isInGitRepo(process.cwd())))
  ) {
    await doPush()
  } else {
    await doClone()
  }
}

async function doPush(): Promise<void> {
  await spawn('git', ['diff-index', '--quiet', 'HEAD', '--']).catch(
    async () => {
      const { continueAnyway } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAnyway',
          message: 'There are uncommited changes; do you want to push anyway?',
          default: false,
        },
      ])
      if (!continueAnyway) process.exit(1)
    }
  )
  const { isPrivate } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'isPrivate',
      message: 'Create private repository?',
      default: false,
    },
  ])
  await createGitHubRepository(process.cwd(), {
    private: isPrivate,
  })
  console.error('Pushing to GitHub...') // eslint-disable-line no-console
  await spawn('git', ['push'], { stdio: 'inherit' })

  if (await fs.exists(path.join('.circleci', 'config.yml'))) {
    await setUpCircleCI(process.cwd())
  } else if (await fs.exists(path.join('.travis.yml'))) {
    await setUpTravisCI(process.cwd())
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
    const { stdout } = await spawn('git', ['config', 'user.name'], {
      maxBuffer: 1024,
    })
    defaultAuthor = stdout.toString('utf8').trim()
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
      filter: (text) => text.split(/\s*,\s*|\s+/g),
      transformer: (values) =>
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
  if (argvSkeleton) answers.skeleton = argvSkeleton
  return answers
}

async function doClone(): Promise<void> {
  const git = await spawn('which', ['hub']).then(
    () => 'hub',
    () => 'git'
  )

  if (await isInGitRepo(process.cwd())) {
    const { continueAnyway } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueAnyway',
        message:
          "You're already inside a git repo; do you want to clone a skeleton inside of it anyway?",
        default: false,
      },
    ])
    if (!continueAnyway) process.exit(1)
  }

  const prompt = await promptForSetUpSkeleton()
  let { skeleton } = prompt
  const {
    directory,
    name,
    description,
    author,
    keywords,
    organization,
    repo,
  } = prompt

  let branch
  const branchMatch = /#([^#]+)$/.exec(skeleton)
  if (branchMatch) {
    skeleton = skeleton.substring(0, branchMatch.index)
    branch = branchMatch[1]
  }

  await spawn(git, ['clone', skeleton, directory], { stdio: 'inherit' })
  if (branch) {
    const mainBranch = (await spawn(
      git,
      ['rev-parse', '--abbrev-ref', 'HEAD'],
      {
        cwd: directory,
        encoding: 'utf8',
        maxBuffer: 10000,
      }
    ): any).stdout.trim(0)
    await spawn(git, ['checkout', branch], { stdio: 'inherit', cwd: directory })
    await spawn(git, ['branch', '-f', mainBranch, branch], {
      stdio: 'inherit',
      cwd: directory,
    })
    await spawn(git, ['checkout', mainBranch], {
      stdio: 'inherit',
      cwd: directory,
    })
  }
  await setUpSkeleton({
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

cli().then(
  () => process.exit(0),
  (err: Error) => {
    console.error(err.stack) // eslint-disable-line no-console
    if ((err: any).stdout) console.error((err: any).stdout.toString('utf8')) // eslint-disable-line no-console
    if ((err: any).stderr) console.error((err: any).stderr.toString('utf8')) // eslint-disable-line no-console
    process.exit(1)
  }
)

export default cli
