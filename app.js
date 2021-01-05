const express = require('express')
const app = express()
const port = 3000

// Database
require('./database/mongo')

// Pipe
require('./config/morgan')(app)
require('./config/body-parser')(app)
require('./config/handlebars')(app)
require('./config/express-static')(app)

app.get('/', (i, o) => {
    let str = ""
    str += "Hello world."
    str += `The time is ${Date().toString()}`
    str += `Here's the Mongoose connection thingy: ${global.mongoose.connection.host}, ${global.mongoose.connection.readyState}`
    o.send(str)
})

app.listen(port, () => console.log(`Listening on port ${port}`))
