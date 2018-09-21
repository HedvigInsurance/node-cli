const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const prompt = require('prompt-sync')
const { print, printError } = require('../utils/io')

const verifyResponse = (response) => {
  if (!/^y/i.test(response)) {
    print('No? Okey, exiting.')
    return false
  }
  return true
}
const getAbsoluteFileLocation = (location) => (file) => path.resolve(process.cwd(), location, file)
const copySurvivalKitFile = (absoluteDirLocation) => {
  const absoluteLocation = getAbsoluteFileLocation(absoluteDirLocation)
  return (file, target) => {
    process.stdout.write(`Copying ${file}...`)
    fs.copyFileSync(require.resolve(`@hedviginsurance/web-survival-kit/${file}`), absoluteLocation(target || file))
    process.stdout.write(chalk.green(' Done\n'))
  }
}
const ensure = (location) => {
  if (!location) {
    process.exitCode = 1
    console.log('Error: No target directory provided')
    return
  }

  const copy = copySurvivalKitFile(location)
  copy('tsconfig.json')
  copy('tslint.json')
  copy('.prettierrc.js')
  copy('jest.config.js')
  copy('test-setup-enzyme.js')
  copy('.babelrc.js')
  copy('template/createProject/.travis.yml', '.travis.yml')

  process.stdout.write('Updating package.json...')
  try {
    const packageTarget = path.resolve(process.cwd(), location, 'package.json')
    const originalPackage = JSON.parse(fs.readFileSync(packageTarget))
    const template = require('@hedviginsurance/web-survival-kit/template/package.json')
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
      print('Config is up to date, except package.json. Enjoy responsibly 💜')
      return
    }
    copy('template/createProject/package.json', 'package.json')
  }

  print('Config is up to date, enjoy responsibly 💜')
  return true
}

const init = (location) => {
  const response = prompt({})('This may overwrite existing config, u sure? [yes/no]: ')
  if (!verifyResponse(response)) {
    return
  }

  const targetLocation = path.resolve(process.cwd(), location, 'hedvig.config.js')
  process.stdout.write(`Copying hedvig.config.js...`)
  fs.copyFileSync(path.resolve(__dirname, '../hedvig.config.sample.js'), targetLocation)
  process.stdout.write(chalk.green('Done\n'))

  print(`hedvig.config.js file initialized at ${targetLocation} 🏁`)
  return true
}

module.exports = { ensure, init }
