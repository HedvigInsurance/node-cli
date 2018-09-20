const fs = require('fs')

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

  return config
}

module.exports = { parseConfig }
