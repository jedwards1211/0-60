// @flow

import { describe, beforeEach, afterEach, it } from 'mocha'
import { expect } from 'chai'
import setUpSkeleton from '../src/setUpSkeleton'
import * as fs from 'fs-extra'
import { promisify } from 'es6-promisify'
import copy from 'copy'
import path from 'path'
import { spawn } from 'promisify-child-process'

const packageDirectory = path.join(__dirname, 'packageTest')

describe('setUpSkeleton', () => {
  beforeEach(async () => {
    await fs.remove(packageDirectory)
    await promisify(copy)(
      path.join(__dirname, 'package', '**'),
      packageDirectory,
      { dot: true }
    )
    await spawn('git', ['init'], { cwd: packageDirectory })
    await spawn(
      'git',
      [
        'remote',
        'add',
        'origin',
        'https://github.com/jedwards1211/0-60-TEST.git',
      ],
      { cwd: packageDirectory }
    )
  })
  afterEach(async function(): Promise<void> {
    if (this.currentTest.state === 'passed') {
      await fs.remove(packageDirectory)
    }
  })
  it(`works`, async function(): Promise<void> {
    const options = {
      packageDirectory,
      name: '@jedwards1211/test-package',
      description: 'this is a test',
      author: 'Jimbob',
      keywords: ['foo', 'bar'],
      git: {
        organization: 'jedwards1211',
        repo: 'test-package',
      },
    }
    const { name, description, author, keywords } = options
    await setUpSkeleton(options)

    // $FlowFixMe
    const packageJson = require(path.join(packageDirectory, 'package.json'))
    expect(packageJson).to.containSubset({
      name,
      description,
      author,
      keywords,
      homepage: 'https://github.com/jedwards1211/test-package#readme',
      bugs: {
        url: 'https://github.com/jedwards1211/test-package/issues',
      },
      repository: {
        type: 'git',
        url: 'https://github.com/jedwards1211/test-package.git',
      },
    })

    const { stdout: origin } = await spawn(
      'git',
      ['remote', 'get-url', 'origin'],
      { cwd: packageDirectory }
    )
    expect(String(origin).trim()).to.equal(
      'https://github.com/jedwards1211/test-package.git'
    )

    const { stdout: skeleton } = await spawn(
      'git',
      ['remote', 'get-url', 'skeleton'],
      { cwd: packageDirectory }
    )
    expect(String(skeleton).trim()).to.equal(
      'https://github.com/jedwards1211/embody.git'
    )

    const readme = await fs.readFile(
      path.join(packageDirectory, 'README.md'),
      'utf8'
    )
    expect(readme).to.match(/^# @jedwards1211\/test-package/)
    expect(readme).to.contain(
      '[![npm version](https://badge.fury.io/js/%40jedwards1211%2Ftest-package.svg)](https://badge.fury.io/js/%40jedwards1211%2Ftest-package)'
    )
    expect(readme).to.contain(options.description)

    const license = await fs.readFile(
      path.join(packageDirectory, 'LICENSE.md'),
      'utf8'
    )
    expect(license).to.contain(options.author)
  })
})
