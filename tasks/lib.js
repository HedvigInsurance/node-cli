const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const { print, copyFileFromPackage } = require('../utils/io')
const { ensurePackageJson } = require('../utils/config')

const copyFileFromLibkit = copyFileFromPackage('@hedviginsurance/libkit/template/createLib')
const copyConfigFiles = location => {
  const copy = copyFileFromLibkit(location)
  copy('tsconfig.json')
  copy('tslint.json')
  copy('.prettierrc.js')
  copy('jest.config.js')
  copy('test-setup.js')
  copy('rollup.config.js')
  copy('.travis.yml')
}

const create = (location) => {
  print('Creating library from scratch')

  copyConfigFiles(location)
  const copy = copyFileFromLibkit(location)
  if (!fs.existsSync(path.resolve(location, 'src'))) {
    fs.mkdirSync(path.resolve(location, 'src'))
  }
  copy('src/index.ts')
  copy('src/index.test.ts')
  ensurePackageJson(copy)('@hedviginsurance/libkit/template/createLib/package.json', location)

  print('Installing libraries')
  childProcess.exec('yarn', (err) => {
    if (err) {
      process.exitCode = 1
      printError('Error: ' + err.message)
      return
    }

    print('Library created, enjoy responsibly 💜')
  })
}

const configEnsure = (location) => {
  print('Updating lib configs')

  copyConfigFiles(location)
  ensurePackageJson(copyFileFromLibkit(location))('@hedviginsurance/libkit/template/createLib/package.json', location)

  print('Library config is up to date 💜')
}

module.exports = { create, configEnsure }
