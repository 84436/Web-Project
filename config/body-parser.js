const express = require('express')

// http://expressjs.com/en/4x/api.html#express.json
function configure(app) {
    const JsonBodyOptions = {
        // none
    }
    app.use(express.json(JsonBodyOptions));
    app.use(express.urlencoded({ extended: true }));
}

module.exports = configure
