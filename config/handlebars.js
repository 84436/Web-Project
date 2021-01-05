const express_handlebars = require('express-handlebars')

// https://github.com/ericf/express-handlebars
function configure(app) {
    const ExpressHandlebarsOptions = {
        defaultLayout: 'main.hbs'
    }
    app.engine('hbs', express_handlebars(ExpressHandlebarsOptions))
    app.set('view engine', 'hbs')
}

module.exports = configure
