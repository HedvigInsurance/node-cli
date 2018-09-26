const path = require('path')

module.exports = {
  clientEntry: path.resolve(__dirname, 'src/clientEntry.tsx'),
  serverEntry: path.resolve(__dirname, 'src/serverEntry.tsx'),
  context: __dirname, // Where webpack should work
  clientPath: path.resolve(__dirname, 'build/assets/'), // Build asset path
  serverPath: path.resolve(__dirname, 'build/'), // Build asset path
  port: undefined, // The WDS port
  developmentPublicPath: undefined, // Client public path during development, i.e. "http://0.0.0.0:8081/". Port must match the port directive
  productionPublicPath: undefined, //  Client public path in production, i.e. "/assets/"
}
