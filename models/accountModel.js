const mongoose = require("mongoose")
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
        "password": info.password,
        "name": info.name,
        "avatar": "",
        "instructorBio": "",
        "type": type
    }
    let new_account = new accountModel(new_account_info)
    await new_account.save((err) => {
        if (err) { r._error = err; return r }
    })

    // WORKAROUND: GET INFO FROM THAT NEWLY CREATED ACCOUNT
    delete(new_account_info.password)
    // new_account_info.joinDate = new_account._doc.joinDate
    r = {
        ...r,
        "_id": new_account.id,
        ...new_account_info
    }
    return r
}

async function closeAccount(id) {
    let r = { _error: null }

    r = {...await checkID(id)}
    if (r._error) return r

    let info = {
        "email": "",
        "password": ""
    }
    await accountModel.findByIdAndUpdate(id, info, (err) => {
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
        "name": new_info.name,
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

async function changePassword(id, oldpw, newpw, confirmpw) {
    let account = await accountModel.findById(id, {_id: 1, password: 1})
    if (!account) {
        return false
    }
    var oldpwHash = account.password
    console.log(oldpwHash)
    if (!bcrypt.compareSync(oldpw, oldpwHash)) {
        return false
    }

    let newpwHash = bcrypt.hashSync(newpw, BCRYPT_WORK_FACTOR)
    if (!bcrypt.compareSync(confirmpw, newpwHash)) {
        return false
    }
    account.password = newpwHash
    account.save()
    return true
}

async function getAllStudent() {
    let filter = {
        type: "student"
    }
    let projection = {
        __v: 0
    }
    return res = await accountModel.find(filter, projection, (err) => {
        return null;
    })
    .lean();
}

async function getAllLecturer() {
    let filter = {
        type: "lecturer"
    }
    let projection = {
        __v: 0
    }
    return res = await accountModel.find(filter, projection, (err) => {
        return null;
    })
    .lean();
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
        email :email
    }
    let account = await accountModel.findOne(filter, {_id: 1, password: 1, name: 1});
    if (!account) {
        r._error = "Account not exist"
        return r
    }

    else {
        if(bcrypt.compareSync(password, account.password)) {
            r = {...r, ...account._doc}
            return r
        }
        else {
            r._error = "Wrong password"
            return r
        }
    }
}

async function registerAccount(newAccount) {
    let r = { _error: null }
    let type = "student"
    newAccount.password = bcrypt.hashSync( newAccount.password, BCRYPT_WORK_FACTOR)
    r = {...await add(newAccount, type)}
    return r
}

/********************************************************************************/

module.exports = {
    add: add,
    closeAccount: closeAccount,
    edit: edit,
    getByID: getByID,
    getByLogin: getByLogin,
    checkID: checkID,
    checkEmail: checkEmail,
    changePassword: changePassword,
    registerAccount: registerAccount,
    getAllStudent: getAllStudent,
    getAllLecturer: getAllLecturer
}
