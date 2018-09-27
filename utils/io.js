const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const print = console.log
const printError = console.error

const verifyResponse = (response) => {
  if (!/^y/i.test(response)) {
    print('No? Okey, exiting.')
    return false
  }
  return true
}

const getAbsoluteFileLocation = (location) => (file) => path.resolve(process.cwd(), location, file)
const copyFileFromPackage = (package) => (absoluteDirLocation) => {
  const absoluteLocation = getAbsoluteFileLocation(absoluteDirLocation)
  return (source, target = source) => {
    process.stdout.write(`Copying ${target}...`)
    fs.copyFileSync(require.resolve(`${package}/${source}`), absoluteLocation(target))
    process.stdout.write(chalk.green(' Done\n'))
  }
}

module.exports = { print, printError, verifyResponse, copyFileFromPackage }
