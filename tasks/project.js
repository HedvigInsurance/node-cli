const webpack = require('webpack')
const WDS = require('webpack-dev-server')
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
    publicPath: config.publicPath,
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
}
const build = (config) => {
  print('Building production bundle 🚀')
  const clientCompiler = webpack(webpackClientProduction({
    entryFile: config.clientEntry,
    port: config.port,
    path: config.path,
    publicPath: config.publicPath,
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

module.exports = { watch, build }
