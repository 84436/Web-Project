/**
 * Check if a given object is a string (primitive) or String
 * https://stackoverflow.com/a/7772724
 * @param {*} str Object to be checked
 */
function isString(str) {
    return typeof(str) === "string" || str instanceof String;
}

/**
 * Check if the given keys exist in an object.
 * @param {*} object Object to check
 * @param {Array<string>} keys Required keys
 */
function missingKeys(object, keys) {
    let errors = {
        "_error": "One or more keys are missing or null",
        "_missing": []
    };

    for (let each of keys) {
        if (
               // non-existent key
               !object.hasOwnProperty(each)
               // null value
            || object[each] === null
               // empty string
            || (isString(object[each]) && object[each].trim().length === 0)
        ) {
            errors._missing.push(each);
        }
    }

    if (errors._missing.length === 0) {
        errors = null
    }

    return errors;
}

module.exports = missingKeys
