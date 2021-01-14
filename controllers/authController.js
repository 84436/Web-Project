const express = require('express')

const router = express.Router()

const accountModel = require("../models/accountModel")

router.get('/login', async (i, o, next) => {
    o.render('account/login')
})

router.post('/login', async (i, o, next) => {
    let email = i.body.email
    let password = i.body.password

    // Cookie
    let auth = accountModel.getByLogin(email, password);
    if (!auth._error) {
        i.session.account = auth.account;
        o.locals.account = auth.account;

        // const url = req.session.retUrl || '/';
        o.redirect("/");
        console.log(o.locals.account);
    }
    else {
        next(auth._err);
    }
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
