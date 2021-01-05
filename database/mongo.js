const mongoose = require('mongoose')

const MongoooseOptions = {
    uri: "mongodb://localhost:27017/main",
    config: {
        // https://mongoosejs.com/docs/deprecations.html
        "useNewUrlParser": true,
        "useFindAndModify": false,
        "useCreateIndex": true,
        "useUnifiedTopology": true,
    }
}

mongoose.connect(MongoooseOptions.uri, MongoooseOptions.config)
mongoose.connection.on("error", console.error.bind(console, "Connection error:"))

global.mongoose = mongoose
