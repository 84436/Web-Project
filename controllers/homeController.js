const express = require('express')
const router = express.Router()
const categoryModel = require("../models/categoryModel")

router.get('/', async (i, o) => {    
    console.log(`query: ${JSON.stringify(i.query.name, null , 4)}`)

    let catList = await categoryModel.getAll();
    let account = {
        name: i.query.name
    }

    console.log(JSON.stringify(account, null, 4));
    o.render('home',
                {
                    Data: {
                        catList: catList,
                        account: account,
                }
            })
    // o.render('home');
})

module.exports = router
