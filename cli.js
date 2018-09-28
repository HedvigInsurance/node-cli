#!/usr/bin/env node

const { print } = require('./utils/io')
const project = require('./tasks/project')
const lib = require('./tasks/lib')
const { parseConfig } = require('./utils/config')

const [, , command, ...args] = process.argv

switch (command) {
  case 'project:create':
    project.create(args[0])
    break
  case 'project:config-ensure':
    project.configEnsure(args[0])
    break
  case 'project:config-init':
    project.configInit(args[0])
    break

  case 'project:watch':
    project.watch(parseConfig(args[0]))
    break
  case 'project:build':
    project.build(parseConfig(args[0]))
    break

  case 'lib:create':
    lib.create(args[0])
    break
  case 'lib:config-ensure':
    lib.configEnsure(args[0])
    break

  default:
    print(
      `Usage:
  Commands:
    - project:create <target directory>
        Initializes a new, functional, production-ready project
    - project:config-ensure <target directory>
        Ensures you have the latest and greatest configs and required packages
    - project:config-init <target directory>
        Creates a hedvig.config.js file
    - project:build <config file>
        Builds and bundles your TypeScript project
    - project:watch <config file>
        Builds, bundles and serves your TypeScript project

    - lib:create <target directory>
        Initializes a new publish-ready lib
    - lib:config-ensure <target directory>
        Ensures you have the latest and greatest configs and required packages
`
    )
    break
}
