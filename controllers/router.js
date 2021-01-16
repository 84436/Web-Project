const express = require('express')

// A custom router for manually debugging hbs templates
let debugRouter = express.Router()
debugRouter.get('/', (i, o) => { o.render('home') })

function configure(app) {
    app.use('/', require('./homeController'))
    app.use('/', require('./authController'))
    app.use('/student', require("./studentController"))
    app.use('/instructor', require("./instructorController"))
    app.use('/admin', require("./adminController"))

    // ALWAYS THE LAST ROUTES. DO NOT MOVE.
    app.use(require('./error'))
}

module.exports = configure
