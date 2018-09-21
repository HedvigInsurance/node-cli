#!/usr/bin/env node

const { print } = require('./utils/io')
const project = require('./tasks/project')
const config = require('./tasks/config')
const { parseConfig } = require('./utils/config')

const [, , command, ...args] = process.argv

switch (command) {
  case 'project:watch':
    project.watch(parseConfig(args[0]))
    break
  case 'project:build':
    project.build(parseConfig(args[0]))
    break

  case 'config:ensure':
    config.ensure(args[0])
    break
  case 'config:init':
    config.init(args[0])
    break

  default:
    print(
      `Usage:
  Commands:
    - project:build <config file>
        Builds and bundles your TypeScript project
    - project:watch <config file>
        Builds, bundles and serves your TypeScript project

    - config:ensure <target directory>
        Ensures you have the latest and greatest configs and required packages
    - config:init <target directory>
        Creates a hedvig.config.js file
`
    )
    break
}
