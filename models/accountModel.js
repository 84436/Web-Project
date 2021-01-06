const mongoose = global.mongoose
const bcrypt = require("bcrypt")
const { BCRYPT_WORK_FACTOR } = require('../config/bcrypt.json')

var accountSchema = new mongoose.Schema({
    email: String,
    name: String,
    avatar: String,

    password: {
        type: String,
        select: false // hide this field when finding accounts
    },
    type: {
        type: String,
        enum: ["student", "lecturer", "admin"],
        default: "student"
    },
    instructorBio: String
})

var accountModel = mongoose.model("account", accountSchema, "accounts")

/********************************************************************************/

async function checkID(id) {
    let r = { _error: null  }

    try {
        let account = await accountModel.findById(id, (err) => {
            if (err) { r._error = err }
        })
        if (!account) {
            r._error = "No account found with given ID"
        }
    }
    catch (referenceExc) {
        r._error = "Invalid ID"
    }

    return r
}

async function checkEmail(email) {
    let r = { _error: null }

    let filter = {
        "email": email
    }
    let account = await accountModel.findOne(filter, (err) => {
        if (err) { r._error = err }
    })
    if (account) {
        r._error = "An account already exists with the given email"
    }

    return r
}

async function add(info, type) {
    let r = { _error: null }

    r = {...await checkEmail(info.email)}
    if (r._error) return r

    let new_account_info = {
        "email": info.email,
        "phone": info.phone,
        "password": info.password,
        "name": info.name,
        "address": info.address,
        "avatar": info.avatar,
        "type": type
    }
    let new_account = new accountModel(new_account_info)
    await new_account.save((err) => {
        if (err) { r._error = err; return r }
    })

    // WORKAROUND: GET INFO FROM THAT NEWLY CREATED ACCOUNT
    delete(new_account_info.password)
    new_account_info.joinDate = new_account._doc.joinDate
    r = {
        ...r,
        "_id": new_account.id,
        ...new_account_info
    }
    return r
}

async function remove(id) {
    let r = { _error: null }

    r = {...await checkID(id)}
    if (r._error) return r

    await accountModel.findByIdAndRemove(id, (err) => {
        if (err) { r._error = err; return r }
    })

    return r
}

async function edit(id, new_info) {
    let r = { _error: null }

    r = {...await checkID(id)}
    if (r._error) return r

    r = {...await checkEmail(new_info.email)}
    if (r._error) return r

    let updated_fields = {
        "email": new_info.email,
        "phone": new_info.phone,
        "password": new_info.password,
        "name": new_info.name,
        "address": new_info.address,
        "avatar": new_info.avatar,
    }

    // remove undefined fields
    // https://stackoverflow.com/a/38340374
    Object.keys(updated_fields).forEach(key => {
        (updated_fields[key] === undefined) && (delete updated_fields[key])
    })

    // if everything"s undefined, silently return
    if (Object.keys(updated_fields).length === 0) {
        return r
    }

    await accountModel.findByIdAndUpdate(id, updated_fields, (err) => {
        if (err) { r._error = err; return r }
    })

    return r
}

async function getByID(id) {
    let r = { _error: null }

    r = {...await checkID(id)}
    if (r._error) return r

    let projection = {
        __v: 0
    }
    let account = await accountModel.findById(id, projection, (err) => {
        if (err) { r._error = err; return r }
    })
        
    r = {...r, ...account._doc}
    return r
}

async function getByLogin(email, password) {
    let r = { _error: null }

    let filter = {
        "email": email,
        "password": bcrypt.hashSync(password, BCRYPT_WORK_FACTOR)
    }
    let projection = {
        __v: 0
    }
    let account = await accountModel.findOne(filter, projection, (err) => {
        if (err) { r._error = err; return r }
    })
    if (!account) {
        r._error = "No account found with given email and password"
        return r
    }

    r = {...r, ...account._doc}
    return r
}

/********************************************************************************/

module.exports = {
    add: add,
    remove: remove,
    edit: edit,
    getByID: getByID,
    getByLogin: getByLogin,
    checkID: checkID,
    checkEmail: checkEmail
}
