const express = require('express')

// https://expressjs.com/en/starter/static-files.html
function configure(app) {
    app.use(express.static('public'))
}

module.exports = configure
