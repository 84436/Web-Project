const morgan = require('morgan')

// https://github.com/expressjs/morgan
function configure(app) {
    app.use(morgan('dev'))
}

module.exports = configure
