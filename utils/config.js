const fs = require('fs')
const path = require('path')
const prompt = require('prompt-sync')
const chalk = require('chalk')
const { print, verifyResponse } = require('./io')

const parseConfig = (file) => {
  if (!fs.existsSync(file)) {
    throw new Error(`No such config file "${file}"`)
  }
  const config = require(`${process.cwd()}/${file}`)

  if (!config.clientEntry) {
    throw new Error('Missing field "clientEntry" in config')
  }
  if (!config.serverEntry) {
    throw new Error('Missing field "serverEntry" in config')
  }
  if (!config.context) {
    throw new Error('Missing field "context" in config')
  }
  if (!config.clientPath) {
    throw new Error('Missing field "clientPath" in config')
  }
  if (!config.serverPath) {
    throw new Error('Missing field "serverPath" in config')
  }

  return config
}

const ensurePackageJson = (copy) => (sourcePackageFile, location) => {
  process.stdout.write('Updating package.json...')
  try {
    const packageTarget = path.resolve(process.cwd(), location, 'package.json')
    const originalPackage = JSON.parse(fs.readFileSync(packageTarget, 'UTF8'))
    const template = require(sourcePackageFile)
    const newPackage = {
      ...originalPackage,
      ...template,
      scripts: {
        ...originalPackage.scripts,
        ...template.scripts,
      },
      dependencies: {
        ...originalPackage.dependencies,
        ...template.dependencies,
      },
      devDependencies: {
        ...originalPackage.devDependencies,
        ...template.devDependencies,
      },
      'lint-staged': {
        ...originalPackage['lint-staged'],
        ...template['lint-staged'],
      }
    }
    fs.writeFileSync(packageTarget, JSON.stringify(newPackage, undefined, 2))
    process.stdout.write(chalk.green(' Done\n'))
  } catch (_e) {
    const response = prompt({})(
      `Could not find, parse or write package.json. Do you wish to create a new one? ${chalk.bold('This WILL overwrite any existing package.json file!')} [y/n]: `
    )
    if (!verifyResponse(response)) {
      print('Config is up to date, except package.json')
      return
    }
    copy('package.json')
  }
}

module.exports = { parseConfig, ensurePackageJson }
