const { createServer } = require('http')
const static = require('./static')

const app = createServer((req, res) => {
    if (/\.html|\.js/.test(req.url)) {
        return static(req, res)
    }
    console.log('2')
})

module.exports = app
