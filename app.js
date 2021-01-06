const express = require('express')
const app = express()
const port = 3000

// Waiting for database
console.log("Waiting for database")
require('./config/mongodb')(app)

// Once ready, configure the rest and go
app.on('ready', () => {

    // A small notification
    console.log(`Connected to ${global.mongoose.connection.host}:${global.mongoose.connection.port}`)

    // Configure
    require('./config/morgan')(app)
    require('./config/body-parser')(app)
    require('./config/handlebars')(app)
    require('./config/express-static')(app)
    require('./config/cookie-session')(app)

    // Add routes
    require('./controllers/router')(app)

    // Listen
    app.listen(port, () => {
        console.log(`Listening on port ${port}`)
    })

})
