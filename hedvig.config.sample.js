const path = require('path')

module.exports = {
  clientEntry: path.resolve(__dirname, 'src/clientEntry.ts'),
  serverEntry: path.resolve(__dirname, 'src/serverEntry.ts'),
  modules: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'src')], // Resolve these modules. Optional
  context: __dirname, // Where webpack should work
  path: path.resolve(__dirname, 'build/'), // Build asset path
  port: undefined, // The WDS port
  developmentPublicPath: undefined, // Client public path during development, i.e. "http://0.0.0.0:8081/". Port must match the port directive
  productionPublicPath: undefined, //  Client public path in production, i.e. "/assets/"
}
