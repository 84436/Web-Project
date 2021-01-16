// A minimally configured app just to test non-parameterized Handlebars templates
const TEMPLATE_NAME = 'account/studentProfile'

const express = require('express')
const app = express()
const port = 3000

require('./config/morgan')(app)
require('./config/express-static')(app)
require('./config/handlebars')(app)

app.get('/', (i, o) => { o.render(TEMPLATE_NAME) })

app.listen(port, () => {
    console.log(`DebugLayout: Listening on port ${port}`)
})
