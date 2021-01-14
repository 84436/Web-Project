const express = require('express')
const router = express.Router()
const categoryModel = require("../models/categoryModel")

router.get('/', async (i, o) => {    
    o.locals.catList = await categoryModel.getAll()
    o.render('home', {})
})

module.exports = router
