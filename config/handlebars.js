const express_handlebars = require('express-handlebars')
const path = require('path')

// https://github.com/ericf/express-handlebars
// https://stackoverflow.com/a/40898191
function configure(app) {
    const ExpressHandlebarsOptions = {
        extname: 'hbs',
        defaultLayout: 'main',
        layoutsDir: path.join(__dirname, '../views/layouts'),
        partialsDir: path.join(__dirname, '../views/partials')
    }
    app.engine('hbs', express_handlebars(ExpressHandlebarsOptions))
    // app.set('views', path.join(__dirname, '../views'))
    app.set('view engine', 'hbs')
}

module.exports = configure
