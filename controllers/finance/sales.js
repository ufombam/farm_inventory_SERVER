const handleGetSales_f = (req, res, db) => {
    const { user } = req.params;
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    db('sales').sum({big: 'small', small: 'big'})
    .where({
        month: month, 
        year: year,
        userid: user 
    })
    .then(data => {
        return res.json(data)
    })
    .catch(() => res.status(400).json('unable to complete request'))
}

const handlePostSales_f = (req, res, db) => {
    const { big, small, date } = req.body;
    const { user } = req.params;
    db.insert({
        date: date,
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        big: big, 
        small: small,
        userid: user
    }).into('sales')
    .catch(() => res.status(400).json('unable to submit'))
}

module.exports = {
    handleGetSales_f,
    handlePostSales_f
}