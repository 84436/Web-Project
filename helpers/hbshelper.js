module.exports = {
    eq(str1, str2) {
        return str1.toString() === str2.toString();
    },

    eqBool(bool1, bool2) {
        return bool1 === bool2;
    },

    dateFormat(date) {
        const dFormat = new Date(date);
        return dFormat.toLocaleDateString(("en-ZA"));
    },
    calSaleOff(price, discount) {
        const saleOffPrice = price - price * discount;
        return saleOffPrice.toFixed(2);
    },
    completeness(state) {
        return (state === true) ? "Completed" : "Ongoing"
    }
};