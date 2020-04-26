const fs = require('fs')
const { join } = require('path')

module.exports = (req, res) => {
    fs.readFile(join(__dirname, '..', req.url), (err, data) => {
        if (err) {
            res.status = 404
            res.end(404)
            return
        }
        res.status = 200
        res.end(data)
    })
}