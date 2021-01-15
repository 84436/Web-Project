const express = require('express')

// A custom router for manually debugging hbs templates
let debugRouter = express.Router()
debugRouter.get('/', (i, o) => { o.render('home') })

function configure(app) {
    // app.use('/',        debugRouter)
    app.use('/',        require('./homeController'))
    app.use('/',        require('./authController'))
    app.use('/account', require('./accountController'))
    app.use('/', require("./courseController"))
    // app.use('/course',  require('./courseController'))

    // ALWAYS THE LAST ROUTES. DO NOT MOVE.
    app.use(require('./error'))
}

module.exports = configure
