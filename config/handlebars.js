const express_handlebars = require('express-handlebars')
const path = require('path')

// https://github.com/ericf/express-handlebars
function configure(app) {
    const ExpressHandlebarsOptions = {
        defaultLayout: 'main.hbs'
    }
    app.engine('hbs', express_handlebars(ExpressHandlebarsOptions))
    app.set('views', path.join(__dirname, '../views'))
    app.set('view engine', 'hbs')
}

module.exports = configure
