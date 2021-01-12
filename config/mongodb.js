const mongoose = require('mongoose')
let this_app

const MongoooseOptions = {
    uri: "mongodb+srv://root:root@ourdemy-main.iyvct.mongodb.net/main",
    config: {
        // https://mongoosejs.com/docs/deprecations.html
        "useNewUrlParser": true,
        "useFindAndModify": false,
        "useCreateIndex": true,
        "useUnifiedTopology": true
    }
}

mongoose.connect(MongoooseOptions.uri, MongoooseOptions.config).catch((err) => {
    console.log('Cannot connect to database.')
    console.log(err)
})
mongoose.connection.once('open', () => {
    this_app.emit('ready')
})

global.mongoose = mongoose

module.exports = (app) => { this_app = app }
