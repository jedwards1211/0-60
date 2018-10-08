// @flow

import {spawn} from 'promisify-child-process'
import getGitHubConfig from './getGitHubConfig'

type Options = {
  private?: ?boolean,
}

async function setUpSemanticRelease(packageDirectory: string, options: Options = {}): Promise<void> {
  const {user} = await getGitHubConfig()
  const cli = spawn('node', [require.resolve('semantic-release-cli/bin/semantic-release'), 'setup', `--gh-username=${user}`], {
    cwd: packageDirectory,
    stdio: 'pipe',
  })
  const forwardInput = data => cli.stdin.write(data)
  let text = ''
  function consume(pattern: RegExp): boolean {
    const result = pattern.exec(text)
    if (result) {
      text = text.substring(result.index + result[0].length)
      return true
    }
    return false
  }
  const handlePrompt = (prompt: Buffer) => {
    process.stdout.write(prompt)
    text += prompt.toString('utf8')
    if (consume(/What is your npm registry/i)) cli.stdin.write('\n')
    if (consume(/What CI are you using/i)) {
      if (options.private) cli.stdin.write('\x17[B')
      cli.stdin.write('\n')
    }
    if (consume(/What is your GitHub username/i)) cli.stdin.write('\n')
    if (consume(/Do you want a `.travis.yml` file/i)) cli.stdin.write('n\n')
    if (consume(/Do you want to overwrite the existing `.travis.yml`/i)) cli.stdin.write('\n')
  }
  process.stdin.on('data', forwardInput)
  cli.stdout.on('data', handlePrompt)
  try {
    await cli
  } finally {
    process.stdin.removeListener('data', forwardInput)
  }
}

export default setUpSemanticRelease

if (!module.parent) {
  setUpSemanticRelease(process.argv[2]).then(console.log, console.error) // eslint-disable-line no-console
}
