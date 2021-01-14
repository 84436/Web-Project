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
    let auth = await accountModel.getByLogin(email, password);    

    if (auth._error === null) {
        let account = {
            _id: auth._id,
            name: auth.name
        }

        console.log(JSON.stringify(account));

        i.session.account = { _id: auth._id, name: auth.name };
        o.locals.account = {_id: auth._id, name: auth.name};

        // console.log(JSON.stringify(auth.account))
        // const url = req.session.retUrl || '/';
        o.redirect(`/?name=${auth.name}`);
    }
    else {
        next(auth._err);
    }
})

router.get('/register', async (i, o, next) => {
    o.render('account/register')
})

router.post('/register', async (i, o, next) => {
    let email = i.body.email;
    let password = i.body.password;

    console.log(JSON.stringify(i.body, null, 4))

    let auth = await accountModel.registerAccount({
        email: email,
        password:password
    });

    // Set cookie

    // const url = req.session.retUrl || '/';
    o.redirect('/')
})

module.exports = router
