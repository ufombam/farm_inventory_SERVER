const handleGetSales = (req, res, db) => {
    const { user } = req.params;
    db.select('id', 'date', 'big', 'small').from('sales').orderBy('id').where('userid', '=', user)
    .then(data => {
        return res.json(data)
    })
    .catch(() => res.status(400).json('unable to complete request'))
}

const handlePostSales = (req, res, db) => {
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
    .then(() => res.status(200).json('submitted'))
    .catch(() => res.status(400).json('unable to submit'))
}

module.exports = {
    handleGetSales,
    handlePostSales,
}