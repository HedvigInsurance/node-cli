#!/usr/bin/env node

const chalk = require('chalk')
const { print } = require('./utils/io')
const project = require('./tasks/project')
const { parseConfig } = require('./utils/config')

const [, , command, ...args] = process.argv

switch (command) {
  case 'project:watch':
    project.watch(parseConfig(args[0]))
    break;
  case 'project:build':
    project.build(parseConfig(args[0]))
    break;

  case 'project:ensure-config':
    project.bootstrap(args[0])
    break;

  default:
    print(
      `Usage:
  Commands:
    - project:build <config file>
    - project:watch <config file>
    - project:ensure-config <target directory>
`
    )
    break
}
