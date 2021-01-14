const express = require('express')

const router = express.Router()

router.get('/login', async (i, o, next) => {
    o.render('account/login')
})

router.post('/login', async (i, o, next) => {
    let email = i.body.email
    let password = i.body.password

    // Cookie

    // const url = req.session.retUrl || '/';
    o.redirect('/')
})

router.get('/register', async (i, o, next) => {
    o.render('account/register')
})

router.post('/register', async (i, o, next) => {
    let email = i.body.email
    let password = i.body.password

    // Set cookie

    // const url = req.session.retUrl || '/';
    o.redirect('/')
})

module.exports = router
