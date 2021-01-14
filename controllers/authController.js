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

    if (!auth._error) {
        let account = {
            _id: auth._id,
            name: auth.name
        }

        i.session.User = account;

        o.redirect("/");
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
    let name = i.body.name;

    let auth = await accountModel.registerAccount({
        email: email,
        password: password,
        name: name
    });

    if (!auth._error) {
        let account = {
            _id: auth._id,
            name: auth.name,
        };

        i.session.User = account;

        o.redirect("/");
    } else {
        next(auth._err);
    }
})

router.get('/logout', async (i, o, next) => {
    i.session.destroy()
    o.redirect("/")
})

module.exports = router
