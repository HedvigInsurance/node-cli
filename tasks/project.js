const webpack = require('webpack')
const WDS = require('webpack-dev-server')
const nodemon = require('nodemon')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const webpackClientProduction = require('@hedviginsurance/web-survival-kit/webpack/webpack.config.client.production')
const webpackClientDevelopment = require('@hedviginsurance/web-survival-kit/webpack/webpack.config.client.development')
const webpackServer = require('@hedviginsurance/web-survival-kit/webpack/webpack.config.server')
const { print, printError } = require('../utils/io')

const watch = (config) => {
  print('Starting development server, watching for changes 👀')
  const clientConfig = webpackClientDevelopment({
    entryFile: config.clientEntry,
    port: config.port,
    path: config.path,
    publicPath: config.developmentPublicPath,
    modules: config.modules,
    context: config.context,
  })
  const clientCompiler = webpack(clientConfig)
  const serverCompiler = webpack(webpackServer({
    entryFile: config.serverEntry,
    path: config.path,
    modules: config.modules,
    context: config.context,
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
  nodemon({ script: path.resolve(config.path, 'index.js') })
}
const build = (config) => {
  print('Building production bundle 🚀')
  const clientCompiler = webpack(webpackClientProduction({
    entryFile: config.clientEntry,
    port: config.port,
    path: config.path,
    publicPath: config.productionPublicPath,
    modules: config.modules,
    context: config.context,
  }))
  const serverCompiler = webpack(webpackServer({
    entryFile: config.serverEntry,
    path: config.path,
    modules: config.modules,
    context: config.context,
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
  return (file) => {
    process.stdout.write(`Copying ${file}...`)
    fs.copyFileSync(require.resolve(`@hedviginsurance/web-survival-kit/${file}`), absoluteLocation(file))
    process.stdout.write(chalk.green(' Done\n'))
  }
}
const ensureConfig = (location) => {
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
  copy('.babelrc.js')

  process.stdout.write(`Copying hedvig.sample.js...`)
  fs.copyFileSync(path.resolve(__dirname, '../hedvig.config.sample.js'), path.resolve(process.cwd(), location, 'hedvig.config.sample.js'))
  process.stdout.write(chalk.green('Done\n'))

  print('Project bootstrapped 👢')
}

module.exports = { watch, build, bootstrap: ensureConfig }
