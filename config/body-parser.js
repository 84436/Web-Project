const express = require('express')

// http://expressjs.com/en/4x/api.html#express.json
function configure(app) {
    const JsonBodyOptions = {
        // none
    }
    app.use(express.json(JsonBodyOptions))
}

module.exports = configure
