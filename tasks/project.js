
const webpack = require('webpack')
const WDS = require('webpack-dev-server')
const nodemon = require('nodemon')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const prompt = require('prompt-sync')
const childProcess = require('child_process')
const webpackClientProduction = require('@hedviginsurance/web-survival-kit/webpack/webpack.config.client.production')
const webpackClientDevelopment = require('@hedviginsurance/web-survival-kit/webpack/webpack.config.client.development')
const webpackServer = require('@hedviginsurance/web-survival-kit/webpack/webpack.config.server')
const { print, printError, copyFileFromPackage, verifyResponse } = require('../utils/io')
const { ensurePackageJson } = require('../utils/config')

const copySurvivalKitFile = copyFileFromPackage('@hedviginsurance/web-survival-kit')

const configEnsure = (location) => {
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

  ensurePackageJson(copy)('@hedviginsurance/web-survival-kit/template/createProject/package.json', location)

  print('Config is up to date, enjoy responsibly 💜')
  return true
}

const configInit = (location) => {
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

const formatStats = (process, stats) => `[${process}] ----> ${stats.toString().split('\n').join(`\n[${process}] ----> `)}`
const watch = (config) => {
  print('Starting development server, watching for changes 👀')
  const port = config.port || 8081
  const publicPath = config.developmentPublicPath || `http://0.0.0.0:${port}/`
  const clientConfig = webpackClientDevelopment({
    entryFile: config.clientEntry,
    port,
    path: config.clientPath,
    publicPath,
    modules: config.modules,
    context: config.context,
  })
  const clientCompiler = webpack(clientConfig)
  const serverCompiler = webpack(webpackServer({
    entryFile: config.serverEntry,
    path: config.serverPath,
    publicPath,
    modules: config.modules,
    context: config.context,
    nodeEnv: 'development',
    mode: 'development',
    envVars: config.envVars,
  }))

  const wds = new WDS(clientCompiler, clientConfig.devServer)
  wds.listen(clientConfig.devServer.port, undefined, () => {
    print(`WDS listening on ${clientConfig.devServer.port} 👂`)
  })

  const watcher = serverCompiler.watch({}, (err, stats) => {
    if (err) {
      printError(`Server change failed to build`, err)
      return
    }

    print(formatStats('server', stats))
    print('Server change built successfully ✅')
  })
  nodemon({ script: path.resolve(config.serverPath, 'index.js') })

  process.on('SIGINT', () => {
    wds.close(() => {
      watcher.close(() => {
        nodemon.emit('quit')
        process.exit(130)
      })
    })
  })
}
const build = (config) => {
  print('Building production bundle 🏗')
  const clientCompiler = webpack(webpackClientProduction({
    entryFile: config.clientEntry,
    port: config.port,
    path: config.clientPath,
    publicPath: config.productionPublicPath || '/assets/',
    modules: config.modules,
    context: config.context,
  }))
  const serverCompiler = webpack(webpackServer({
    entryFile: config.serverEntry,
    path: config.serverPath,
    publicPath: config.productionPublicPath || '/assets/',
    modules: config.modules,
    context: config.context,
    nodeEnv: 'production',
    mode: 'production',
    envVars: config.envVars,
  }))

  clientCompiler.run((err, stats) => {
    if (err) {
      printError(`Client failed to build`, err)
      process.exitCode = 1
      return
    }

    print(formatStats('client', stats))
    print('Client built successfully ✅')
  })
  serverCompiler.run((err, stats) => {
    if (err) {
      printError(`Server failed to build`, err)
      process.exitCode = 1
      return
    }

    print(formatStats('server', stats))
    print('Server built successfully ✅')
  })
}

const create = (location) => {
  if (!location) {
    process.exitCode = 1
    printError('Error: No target directory provided')
    return
  }

  print('Ensuring config')
  if (!configEnsure(location)) {
    process.exitCode = 1
    return
  }
  print('Config OK')

  print('Initializing config file')
  if (!configInit(location)) {
    process.exitCode = 1
    return
  }
  print('Config file OK')

  process.stdout.write('Creating src directory...')
  if (fs.existsSync(path.resolve(process.cwd(), location, 'src'))) {
    process.stdout.write(chalk.yellow(' Skipping\n'))
  } else {
    fs.mkdirSync(path.resolve(process.cwd(), location, 'src'))
    process.stdout.write(chalk.green(' Done\n'))
  }

  const copy = copySurvivalKitFile(location)
  print('Copying sample files...')
  copy('template/createProject/src/clientEntry.tsx', 'src/clientEntry.tsx')
  copy('template/createProject/src/serverEntry.tsx', 'src/serverEntry.tsx')
  copy('template/createProject/src/App.tsx', 'src/App.tsx')
  copy('template/createProject/src/App.test.tsx', 'src/App.test.tsx')
  print(chalk.green('Sample files copied'))

  print('Installing libraries')
  childProcess.exec('yarn', (err)=> {
    if (err) {
      process.exitCode = 1
      printError('Error: ' + err.message)
      return
    }

    print('Project created, use it responsibly 💜')
  })
}

module.exports = { configEnsure, configInit, watch, build, create }
