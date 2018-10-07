/* eslint-env node */

import chai from 'chai'
import subset from 'chai-subset'
chai.use(subset)

if (process.argv.indexOf('--watch') >= 0) {
  before(() => process.stdout.write('\u001b[2J\u001b[1;1H\u001b[3J'))
}
