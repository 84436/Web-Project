const express = require('express')
const router = express.Router()

router.get('/', (i, o) => {
    o.render('home', {})
})

module.exports = router
