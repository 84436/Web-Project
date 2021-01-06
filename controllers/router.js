const express = require('express')

function configure(app) {
    app.use('/',        require('./homeController'))
    // app.use('/account', require('./accountController'))
    // app.use('/course',  require('./courseController'))

    // ALWAYS THE LAST ROUTES. DO NOT MOVE.
    app.use(require('./error'))
}

module.exports = configure
