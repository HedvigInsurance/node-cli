const webpack = require('webpack')
const WDS = require('webpack-dev-server')
const nodemon = require('nodemon')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const childProcess = require('child_process')
const webpackClientProduction = require('@hedviginsurance/web-survival-kit/webpack/webpack.config.client.production')
const webpackClientDevelopment = require('@hedviginsurance/web-survival-kit/webpack/webpack.config.client.development')
const webpackServer = require('@hedviginsurance/web-survival-kit/webpack/webpack.config.server')
const { print, printError } = require('../utils/io')
const config = require('./config')

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
  }))

  const wds = new WDS(clientCompiler, clientConfig.devServer)
  wds.listen(clientConfig.devServer.port, () => {
    print(`WDS listening on ${clientConfig.devServer.port} 👂`)
  })

  serverCompiler.watch({}, (err, stats) => {
    if (err) {
      printError(`Server change failed to build`, err)
      return
    }

    print('Server change built successfully ✅')
    print(stats.toString())
  })
  nodemon({ script: path.resolve(config.serverPath, 'index.js') })
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
  }))

  clientCompiler.run((err, stats) => {
    if (err) {
      printError(`Client failed to build`, err)
      process.exitCode = 1
      return
    }

    print('Client built successfully ✅')
    print(stats.toString())
  })
  serverCompiler.run((err, stats) => {
    if (err) {
      printError(`Server failed to build`, err)
      process.exitCode = 1
      return
    }

    print('Server built successfully ✅')
    print(stats.toString())
  })
}

const getAbsoluteFileLocation = (location) => (file) => path.resolve(process.cwd(), location, file)
const copySurvivalKitFile = (absoluteDirLocation) => {
  const absoluteLocation = getAbsoluteFileLocation(absoluteDirLocation)
  return (source, target = source) => {
    process.stdout.write(`Copying ${target}...`)
    fs.copyFileSync(require.resolve(`@hedviginsurance/web-survival-kit/${source}`), absoluteLocation(target))
    process.stdout.write(chalk.green(' Done\n'))
  }
}

const create = (location) => {
  if (!location) {
    process.exitCode = 1
    printError('Error: No target directory provided')
    return
  }

  print('Ensuring config')
  if (!config.ensure(location)) {
    process.exitCode = 1
    return
  }
  print('Config OK')

  print('Initializing config file')
  if (!config.init(location)) {
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

module.exports = { watch, build, create }
